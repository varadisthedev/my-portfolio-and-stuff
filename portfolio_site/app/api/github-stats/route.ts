import { getGithubStats } from "@/lib/githubStats";

export async function GET() {
  try {
    const stats = await getGithubStats();
    if (!stats) {
      return Response.json(
        { error: "GitHub stats are not available right now" },
        { status: 503 }
      );
    }
    return Response.json(stats);
  } catch (error) {
    console.error("GET /api/github-stats failed:", error);
    return Response.json(
      { error: "Unable to load GitHub stats" },
      { status: 500 }
    );
  }
}
