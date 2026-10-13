// Run: node lib/domain-url.check.mjs
import assert from "node:assert";
import { domainUrlSchema } from "./domain-url.ts";

const ok = (input, expected) => assert.equal(domainUrlSchema.parse(input), expected, input);
ok("example.com", "https://example.com");
ok("  example.com/health ", "https://example.com/health");
ok("http://example.com", "http://example.com");
ok("localhost:3000/health", "https://localhost:3000/health");
for (const bad of ["", "ftp://example.com", "javascript://x", "not a url"]) {
  assert.equal(domainUrlSchema.safeParse(bad).success, false, bad);
}
assert.equal(domainUrlSchema.optional().parse(undefined), undefined);
console.log("domain-url checks ok");
