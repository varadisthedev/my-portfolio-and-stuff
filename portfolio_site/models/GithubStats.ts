import mongoose from "mongoose";

const githubStatsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  repoCount: { type: Number, required: true, default: 0 },
  linesAdded: { type: Number, required: true, default: 0 },
  linesDeleted: { type: Number, required: true, default: 0 },
  loc: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, required: true, default: Date.now },
});

const GithubStats =
  mongoose.models.GithubStats || mongoose.model("GithubStats", githubStatsSchema);

export default GithubStats;
