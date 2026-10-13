// Next 16.4 loads server/preview-props.json at startup, but @opennextjs/cloudflare 1.20.11
// doesn't inline it, so the worker throws "Unexpected loadManifest" on init.
// ponytail: patches node_modules on install; delete once OpenNext bundles preview-props itself.
import { readFileSync, writeFileSync } from "node:fs";

const file = "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js";
const from = "{*-manifest,required-server-files,prefetch-hints}.json";
const to = "{*-manifest,required-server-files,prefetch-hints,preview-props}.json";

const src = readFileSync(file, "utf8");
if (src.includes(to)) process.exit(0);
if (!src.includes(from)) throw new Error(`patch-opennext: pattern not found in ${file}; OpenNext changed, recheck the fix`);
writeFileSync(file, src.replace(from, to));
console.log("patch-opennext: preview-props.json will be inlined");
