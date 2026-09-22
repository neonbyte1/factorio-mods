/**
 * Upload the packed mod archive to the Factorio mod portal and sync the mod
 * page from the repository.
 *
 * Run from a mod directory (cwd = <mod>/) after `deno task pack`. Reads
 * info.json for name+version and uploads build/<name>_<version>.zip. Mods not
 * yet on the portal are created through the publish API; existing mods receive
 * a new release through the upload API. A version the portal already lists is
 * not uploaded again, so re-running a release is safe.
 *
 * After the upload, the mod page details are overwritten from two files that
 * are portal-only metadata and never packed into the mod zip:
 *
 *   README.md     description (markdown)
 *   release.json  {
 *                   "category": "content",
 *                   "tags": ["circuit-network"],
 *                   "license": "default_mit",           (optional)
 *                   "source_url": "https://github.com/…" (optional)
 *                 }
 *
 * Both are validated before anything is uploaded.
 *
 * Requires FACTORIO_API_KEY (https://factorio.com/profile) with the usages
 * "ModPortal: Upload Mods", "ModPortal: Edit Mods", and, for a mod's first
 * release, "ModPortal: Publish Mods".
 */
import { join } from "@std/path";

interface Info {
  name: string;
  version: string;
}

interface Release {
  category: string;
  tags: string[];
  license?: string;
  source_url?: string;
}

interface PortalResponse {
  upload_url?: string;
  success?: boolean;
  error?: string;
  message?: string;
}

const PORTAL = "https://mods.factorio.com";

// Values the portal accepts. Taken from the mods.factorio.com search facets;
// the wiki's "Mod details API" page predates the `planets` and `character` tags.
const CATEGORIES: Record<string, true> = {
  "no-category": true,
  content: true,
  overhaul: true,
  tweaks: true,
  utilities: true,
  scenarios: true,
  "mod-packs": true,
  localizations: true,
  internal: true,
};
const TAGS: Record<string, true> = {
  planets: true,
  transportation: true,
  logistics: true,
  trains: true,
  combat: true,
  armor: true,
  character: true,
  enemies: true,
  environment: true,
  mining: true,
  fluids: true,
  "logistic-network": true,
  "circuit-network": true,
  manufacturing: true,
  power: true,
  storage: true,
  blueprints: true,
  cheats: true,
};
const LICENSES: Record<string, true> = {
  default_mit: true,
  default_gnugplv3: true,
  default_gnulgplv3: true,
  default_mozilla2: true,
  default_apache2: true,
  default_unlicense: true,
};
/** Custom licenses: `custom_<ID>` from mods.factorio.com/licenses/edit/<ID>. */
const CUSTOM_LICENSE_RE = /^custom_\w+$/;
const RELEASE_KEYS: Record<keyof Release, true> = {
  category: true,
  tags: true,
  license: true,
  source_url: true,
};

const apiKey = Deno.env.get("FACTORIO_API_KEY") ||
  fail("FACTORIO_API_KEY is not set");
const auth = { Authorization: `Bearer ${apiKey}` };

const infoRaw = await Deno.readTextFile("info.json").catch(() =>
  fail(`no info.json in ${Deno.cwd()}; run publish from a mod directory`)
);
const info = JSON.parse(infoRaw) as Info;
if (!info.name || !info.version) fail(`info.json missing 'name' or 'version'`);

const release = await readRelease();
const description = await Deno.readTextFile("README.md").catch(() =>
  fail(`no README.md in ${Deno.cwd()}; it becomes the mod page description`)
);
if (!description.trim()) fail("README.md is empty");

const archiveName = `${info.name}_${info.version}.zip`;
const archivePath = join("build", archiveName);
const archive = await Deno.readFile(archivePath).catch(() =>
  fail(`no ${archivePath}; run 'deno task pack' first`)
);

const releases = await fetchReleases(info.name);
if (releases?.includes(info.version)) {
  console.log(
    `${info.name} ${info.version} is already on the mod portal; skipping upload`,
  );
} else {
  const isNewMod = releases === undefined;
  const initBody = new FormData();
  initBody.set("mod", info.name);
  const initEndpoint = isNewMod ? "init_publish" : "releases/init_upload";
  const { upload_url } = await post(
    initEndpoint,
    `${PORTAL}/api/v2/mods/${initEndpoint}`,
    initBody,
    auth,
  );
  if (!upload_url) fail(`${initEndpoint}: response has no upload_url`);

  const uploadBody = new FormData();
  uploadBody.set(
    "file",
    new File([archive], archiveName, { type: "application/zip" }),
  );
  await post("finish_upload", upload_url, uploadBody);
  console.log(
    `${isNewMod ? "Published" : "Released"} ${info.name} ${info.version}`,
  );
}

const details = new FormData();
details.set("mod", info.name);
details.set("description", description);
details.set("category", release.category);
for (const tag of release.tags) details.append("tags", tag);
if (release.license) details.set("license", release.license);
if (release.source_url) details.set("source_url", release.source_url);
await post(
  "edit_details",
  `${PORTAL}/api/v2/mods/edit_details`,
  details,
  auth,
);
console.log(`Updated mod page → ${PORTAL}/mod/${info.name}`);

async function readRelease(): Promise<Release> {
  const raw = await Deno.readTextFile("release.json").catch(() =>
    fail(`no release.json in ${Deno.cwd()}`)
  );
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (err) {
    fail(`release.json: ${(err as Error).message}`);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail("release.json: expected a JSON object");
  }

  const release = value as Record<string, unknown>;
  const errors: string[] = [];
  for (const key of Object.keys(release)) {
    if (!Object.hasOwn(RELEASE_KEYS, key)) errors.push(`unknown key '${key}'`);
  }
  if (!isOneOf(release.category, CATEGORIES)) {
    errors.push(
      `'category' must be one of: ${Object.keys(CATEGORIES).join(", ")}`,
    );
  }
  if (!Array.isArray(release.tags)) {
    errors.push("'tags' must be an array");
  } else {
    for (const tag of release.tags) {
      if (!isOneOf(tag, TAGS)) {
        errors.push(
          `unknown tag ${JSON.stringify(tag)}; allowed: ${
            Object.keys(TAGS).join(", ")
          }`,
        );
      }
    }
  }
  if (
    release.license !== undefined &&
    !isOneOf(release.license, LICENSES) &&
    !(typeof release.license === "string" &&
      CUSTOM_LICENSE_RE.test(release.license))
  ) {
    errors.push(
      `'license' must be custom_<ID> or one of: ${
        Object.keys(LICENSES).join(", ")
      }`,
    );
  }
  if (release.source_url !== undefined && !isHttpUrl(release.source_url)) {
    errors.push(
      "'source_url' must be an http(s) URL of at most 256 characters",
    );
  }
  if (errors.length > 0) fail(`release.json:\n  ${errors.join("\n  ")}`);

  return release as unknown as Release;
}

function isOneOf(value: unknown, allowed: Record<string, true>): boolean {
  return typeof value === "string" && Object.hasOwn(allowed, value);
}

function isHttpUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.length > 256) return false;
  const protocol = URL.parse(value)?.protocol;
  return protocol === "http:" || protocol === "https:";
}

/** Versions the portal lists for `name`; `undefined` when the mod does not exist yet. */
async function fetchReleases(name: string): Promise<string[] | undefined> {
  const res = await fetch(`${PORTAL}/api/mods/${encodeURIComponent(name)}`);
  if (res.status === 404) {
    await res.body?.cancel();
    return undefined;
  }
  if (!res.ok) {
    fail(`mod details request failed: HTTP ${res.status} ${await res.text()}`);
  }
  const details = await res.json() as { releases?: { version: string }[] };
  return (details.releases ?? []).map((release) => release.version);
}

async function post(
  label: string,
  url: string,
  body: FormData,
  headers?: HeadersInit,
): Promise<PortalResponse> {
  const res = await fetch(url, { method: "POST", body, headers });
  const text = await res.text();
  let json: PortalResponse;
  try {
    json = JSON.parse(text) as PortalResponse;
  } catch {
    fail(`${label}: HTTP ${res.status}, non-JSON response: ${text}`);
  }
  if (!res.ok || json.error) {
    fail(
      `${label}: ${json.error ?? `HTTP ${res.status}`}: ${
        json.message ?? text
      }`,
    );
  }
  return json;
}

function fail(message: string): never {
  console.error(message);
  Deno.exit(1);
}
