// One-off seed for the links this deployment ships with day one.
// Safe to re-run: upserts by platform, so it won't create duplicates.
//
//   npm run seed
import mongoose from "mongoose";
import LinkModel from "../lib/db/models/Link.ts";

const SEED_LINKS = [
  { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/varad-raut-/" },
  { platform: "github", label: "GitHub", url: "https://github.com/varadisthedev" },
  { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/_varadraut/" },
  { platform: "leetcode", label: "LeetCode", url: "https://leetcode.com/u/b7C9FnrSBH/" },
  { platform: "email", label: "Email", url: "mailto:varadisthedev@gmail.com" },
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not found in environment variables");

  await mongoose.connect(uri);

  for (const [order, link] of SEED_LINKS.entries()) {
    await LinkModel.updateOne(
      { platform: link.platform },
      { $set: { ...link, order } },
      { upsert: true },
    );
    console.log(`seeded: ${link.platform}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
