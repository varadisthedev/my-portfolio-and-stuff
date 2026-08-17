import { connectToMongo } from "@/lib/connectToMongo";
import GithubStats from "@/models/GithubStats";

const USERNAME = "varadisthedev";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
// Safety cap on total GraphQL round-trips for one crawl (repo list pages +
// one commit-history page per repo, usually). Guards against ever looping
// forever on a pagination bug rather than a real limit we expect to hit.
const MAX_GRAPHQL_CALLS = 400;
// A raw sum of git additions is dominated by a handful of non-organic bulk
// commits — a Jupyter notebook dump and a vendored-dependency commit each
// added 150K-600K "lines" in one shot across this account's repos, which
// would put the total in the millions and read as fake. Capping any single
// commit's counted additions filters those out while still counting real,
// large-but-genuine commits (the biggest seen otherwise was ~9K). Chosen by
// comparing capped totals against the raw per-repo numbers until outliers
// were gone but normal commits were untouched.
const PER_COMMIT_ADDITION_CAP = 3000;
// Transient 5xx/empty-body responses from GitHub's GraphQL endpoint happen
// occasionally under normal load — retry a few times before giving up.
const MAX_RETRIES = 3;

export type GithubStatsResult = {
  repoCount: number;
  linesAdded: number;
  linesDeleted: number;
  loc: number;
  updatedAt: string;
  stale: boolean;
};

async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
  attempt = 1
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set in environment variables");
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL request failed: ${response.status} ${await response.text()}`
    );
  }

  const json = await response.json();

  // GitHub's GraphQL endpoint occasionally returns a bare error message
  // with no `data` field ("No server is currently available...") under
  // normal, non-rate-limited conditions — a brief retry clears it.
  if (!json.data) {
    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      return graphql<T>(query, variables, attempt + 1);
    }
    throw new Error(`GitHub GraphQL returned no data: ${JSON.stringify(json)}`);
  }

  if (json.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

async function fetchOwnerId(): Promise<string> {
  const data = await graphql<{ user: { id: string } }>(
    `query ($login: String!) {
      user(login: $login) {
        id
      }
    }`,
    { login: USERNAME }
  );
  return data.user.id;
}

type RepoNode = {
  name: string;
  defaultBranchRef: { target: { __typename: string } } | null;
};

type FetchOwnedReposResponse = {
  user: {
    repositories: {
      pageInfo: { endCursor: string | null; hasNextPage: boolean };
      nodes: RepoNode[];
    };
  };
};

/** Owned, non-fork repositories only — the same set `lib/projects.ts`'s
 * "top 3" reasoning draws from, so the repo count and the LOC total below
 * describe the same body of work. */
async function fetchOwnedRepos(callBudget: { remaining: number }) {
  const repos: RepoNode[] = [];
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext && callBudget.remaining-- > 0) {
    const data: FetchOwnedReposResponse = await graphql<FetchOwnedReposResponse>(
      `query ($login: String!, $cursor: String) {
        user(login: $login) {
          repositories(
            first: 50
            after: $cursor
            ownerAffiliations: [OWNER]
            isFork: false
          ) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              name
              defaultBranchRef {
                target {
                  __typename
                }
              }
            }
          }
        }
      }`,
      { login: USERNAME, cursor }
    );

    repos.push(...data.user.repositories.nodes);
    hasNext = data.user.repositories.pageInfo.hasNextPage;
    cursor = data.user.repositories.pageInfo.endCursor;
  }

  return repos;
}

type CommitNode = {
  additions: number;
  deletions: number;
  author: { user: { id: string } | null };
};

type FetchRepoLocResponse = {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          pageInfo: { endCursor: string | null; hasNextPage: boolean };
          nodes: CommitNode[];
        };
      };
    } | null;
  };
};

/** Sums additions/deletions across the default branch's history for one
 * repo, counting only commits authored by `ownerId` (co-authored or
 * external commits in a repo you own shouldn't count as "lines you
 * wrote"). */
async function fetchRepoLoc(
  repoName: string,
  ownerId: string,
  callBudget: { remaining: number }
): Promise<{ additions: number; deletions: number }> {
  let additions = 0;
  let deletions = 0;
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext && callBudget.remaining-- > 0) {
    const data: FetchRepoLocResponse = await graphql<FetchRepoLocResponse>(
      `query ($owner: String!, $name: String!, $cursor: String) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100, after: $cursor) {
                  pageInfo {
                    endCursor
                    hasNextPage
                  }
                  nodes {
                    additions
                    deletions
                    author {
                      user {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      { owner: USERNAME, name: repoName, cursor }
    );

    const ref = data.repository.defaultBranchRef;
    if (!ref) break;

    for (const commit of ref.target.history.nodes) {
      if (commit.author.user?.id === ownerId) {
        additions += Math.min(commit.additions, PER_COMMIT_ADDITION_CAP);
        deletions += commit.deletions;
      }
    }

    hasNext = ref.target.history.pageInfo.hasNextPage;
    cursor = ref.target.history.pageInfo.endCursor;
  }

  return { additions, deletions };
}

async function computeGithubStats(): Promise<Omit<GithubStatsResult, "stale">> {
  const callBudget = { remaining: MAX_GRAPHQL_CALLS };
  const ownerId = await fetchOwnerId();
  const repos = await fetchOwnedRepos(callBudget);
  const nonEmptyRepos = repos.filter((repo) => repo.defaultBranchRef);

  let linesAdded = 0;
  let linesDeleted = 0;

  for (const repo of nonEmptyRepos) {
    if (callBudget.remaining <= 0) break;
    const { additions, deletions } = await fetchRepoLoc(
      repo.name,
      ownerId,
      callBudget
    );
    linesAdded += additions;
    linesDeleted += deletions;
  }

  return {
    repoCount: repos.length,
    linesAdded,
    linesDeleted,
    loc: linesAdded - linesDeleted,
    updatedAt: new Date().toISOString(),
  };
}

async function persist(stats: Omit<GithubStatsResult, "stale">) {
  await connectToMongo();
  await GithubStats.findOneAndUpdate(
    { key: "main" },
    { ...stats, key: "main", updatedAt: new Date(stats.updatedAt) },
    { upsert: true }
  );
}

// In-memory guard against one warm serverless instance kicking off two
// overlapping background crawls — not a distributed lock, just cheap
// insurance within a single process.
let refreshing = false;

async function refreshInBackground() {
  if (refreshing) return;
  refreshing = true;
  try {
    const fresh = await computeGithubStats();
    await persist(fresh);
  } catch (error) {
    console.error("GitHub stats background refresh failed:", error);
  } finally {
    refreshing = false;
  }
}

/**
 * Cached, rarely-slow accessor. Normal path is a single Mongo read. A crawl
 * across every owned repo's commit history only runs when the cache is
 * empty (first deploy — that one request waits) or stale (kicked off
 * without blocking the caller, so visitors always get an immediate
 * response even if the number they see is up to `CACHE_TTL_MS` old).
 */
export async function getGithubStats(): Promise<GithubStatsResult | null> {
  await connectToMongo();
  const cached = await GithubStats.findOne({ key: "main" }).lean<{
    repoCount: number;
    linesAdded: number;
    linesDeleted: number;
    loc: number;
    updatedAt: Date;
  } | null>();

  const isStale =
    !cached || Date.now() - cached.updatedAt.getTime() > CACHE_TTL_MS;

  if (cached) {
    if (isStale) void refreshInBackground();
    return {
      repoCount: cached.repoCount,
      linesAdded: cached.linesAdded,
      linesDeleted: cached.linesDeleted,
      loc: cached.loc,
      updatedAt: cached.updatedAt.toISOString(),
      stale: isStale,
    };
  }

  try {
    const fresh = await computeGithubStats();
    await persist(fresh);
    return { ...fresh, stale: false };
  } catch (error) {
    console.error("GitHub stats initial computation failed:", error);
    return null;
  }
}
