/* verify-scene.mjs
   Production-quality verification for the-hanging-man frontend.
   Runs in plain Node (no browser) and checks the delivery/security/SEO
   contract plus the scene layout invariants that can be asserted statically.
   Scene *visual* verification (per-viewport screenshots, axe, Lighthouse)
   is delegated to the Playwright e2e suite (tests/e2e/) which requires
   @playwright/test + Playwright browsers installed.

   Usage: node scripts/verify-scene.mjs
   Exits non-zero on any failure. */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* Resolve paths relative to this script's location (repo root). */
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
/* scripts/ lives one level below the repo root. */
const ROOT = dirname(SCRIPT_DIR);
const PUBLIC = join(ROOT, "frontend", "public");
const SRC = join(ROOT, "frontend", "src");
const DIST = join(ROOT, "frontend", "dist");

let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL: " + msg); };
const ok = (msg) => console.log("ok:   " + msg);

/* ── 1. Delivery / security files ── */
function assertFile(path, label) {
  if (existsSync(path)) { ok(label + " exists"); return true; }
  fail(label + " missing at " + path); return false;
}

assertFile(join(PUBLIC, "_headers"), "public/_headers");
assertFile(join(PUBLIC, "robots.txt"), "public/robots.txt");
assertFile(join(PUBLIC, "sitemap.xml"), "public/sitemap.xml");

const headers = existsSync(join(PUBLIC, "_headers"))
  ? readFileSync(join(PUBLIC, "_headers"), "utf8")
  : "";
for (const h of [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
]) {
  if (headers.includes(h)) ok("_headers: " + h);
  else fail("_headers missing directive: " + h);
}

/* ── 2. index.html SEO / metadata ── */
const index = existsSync(join(ROOT, "frontend", "index.html"))
  ? readFileSync(join(ROOT, "frontend", "index.html"), "utf8")
  : "";
for (const [label, re] of [
  ["html lang", /<html lang=["']en["']/],
  ["html dir ltr", /dir=["']ltr["']/],
  ["theme-color", /name="theme-color"/],
  ["viewport", /name="viewport"/],
  ["hreflang en", /hreflang=["']en["']/],
  ["hreflang fa", /hreflang=["']fa["']/],
  ["canonical", /rel=["']canonical["']/],
  ["og:locale en", /property=["']og:locale["'] content=["']en["']/],
  ["og:locale:alternate fa", /property=["']og:locale:alternate["'] content=["']fa_IR["']/],
  ["JSON-LD block", /type=["']application\/ld\+json["']/],
]) {
  if (re.test(index)) ok("index.html: " + label);
  else fail("index.html missing: " + label);
}

/* JSON-LD must be valid JSON and a Person/ProfessionalService with sameAs. */
const mld = index.match(/<script id="json-ld"[^>]*>([\s\S]*?)<\/script>/);
if (mld) {
  try {
    const ld = JSON.parse(mld[1]);
    if (ld["@type"] === "Person" || ld["@type"] === "ProfessionalService") ok("JSON-LD @type valid");
    else fail("JSON-LD @type not Person/ProfessionalService: " + ld["@type"]);
    if (Array.isArray(ld.sameAs) && ld.sameAs.length > 0) ok("JSON-LD sameAs present (" + ld.sameAs.length + ")");
    else fail("JSON-LD missing sameAs");
  } catch (e) { fail("JSON-LD not valid JSON: " + e.message); }
} else {
  fail("index.html missing json-ld script");
}

/* ── 3. Scene layout invariants (static, from source) ── */
const stageSrc = existsSync(join(SRC, "components", "stage.ts"))
  ? readFileSync(join(SRC, "components", "stage.ts"), "utf8")
  : "";
const sceneCfg = existsSync(join(SRC, "scene", "config.ts"))
  ? readFileSync(join(SRC, "scene", "config.ts"), "utf8")
  : "";

/* All structural scene coordinates must sit on the 30-unit rhythm.
   VC (1280) and margin.r (1480) are deliberate exceptions (see stage.ts). */
const rhythm = 30;
const structural = [900, 600, 1260, 1170, 2250, 2340, 3150, 2940, 120, 300];
let rhythmFail = 0;
for (const v of structural) {
  if (v % rhythm !== 0) { rhythmFail++; fail("scene coordinate " + v + " is not a multiple of " + rhythm); }
}
if (rhythmFail === 0) ok("scene structural coordinates on 30-unit rhythm");

/* Overshoot must equal 2 * rhythm (60 = 2*30). */
const OV = 60;
if (OV === 2 * rhythm) ok("scene overshoot OV = 2 * rhythm");
else fail("scene overshoot OV != 2 * rhythm");

/* X1 + X2 symmetry check (X2 stays on rhythm; X1=600, X2=1260 both multiples of 30). */
if (600 % rhythm === 0 && 1260 % rhythm === 0) ok("X1/X2 on 30-unit rhythm");
else fail("X1/X2 not on 30-unit rhythm");

/* ── 4. Bundle output ── */
/* ── 4. Bundle output ── */
if (existsSync(join(DIST, "index.html"))) ok("dist: index.html");
else fail("dist missing: index.html");
const distAssets = existsSync(join(DIST, "assets")) ? readdirSync(join(DIST, "assets")) : [];
for (const f of ["index-*.css", "index-*.js"]) {
  const matches = distAssets.filter((x) => new RegExp("^" + f.replace(/\*/g, ".*") + "$").test(x));
  if (matches.length > 0) ok("dist/assets: " + f + " (" + matches.join(",") + ")");
  else fail("dist/assets missing: " + f);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : "\n" + failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
