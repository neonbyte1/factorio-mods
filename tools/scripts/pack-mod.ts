/**
 * Package the current mod directory into a Factorio-compatible zip archive.
 *
 * Run from a mod directory (cwd = <mod>/). Reads info.json for name+version,
 * flattens dist/ into <name>_<version>/ inside the archive (Factorio requires
 * .lua files at the mod root because `require` maps `foo.bar` to `foo/bar.lua`),
 * preserves optional asset trees, then emits build/<name>_<version>.zip.
 *
 * Required at the mod root: info.json, changelog.txt, LICENSE
 *
 * Optional trees included when present at the mod root:
 *   locale/  migrations/  graphics/  sound/  scenarios/  campaigns/  tutorials/
 *
 * Optional loose files included when present at the mod root:
 *   thumbnail.png
 *
 * Symlinks are resolved: each mod's LICENSE links to the repository-root
 * LICENSE, and the archive receives the target's content.
 *
 * Anything else stays out of the archive, notably README.md and release.json:
 * they are mod portal metadata consumed by publish-mod.ts.
 */
import * as zip from "@quentinadam/zip";
import { exists, walk } from "@std/fs";
import { dirname, join, relative, SEPARATOR } from "@std/path";

interface Info {
  name: string;
  version: string;
}

const OPTIONAL_TREES: readonly string[] = [
  "locale",
  "migrations",
  "graphics",
  "sound",
  "scenarios",
  "campaigns",
  "tutorials",
];
const REQUIRED_FILES: readonly string[] = ["changelog.txt", "LICENSE"];
const OPTIONAL_FILES: readonly string[] = ["thumbnail.png"];

const modDir = Deno.cwd();

const infoRaw = await Deno.readTextFile("info.json").catch(() => {
  console.error(`no info.json in ${modDir}; run pack from a mod directory`);
  Deno.exit(1);
});
const info = JSON.parse(infoRaw) as Info;
if (!info.name || !info.version) {
  console.error(`info.json missing 'name' or 'version'`);
  Deno.exit(1);
}

if (!(await exists("dist", { isDirectory: true }))) {
  console.error(`no dist/ in ${modDir}; run 'deno task build' first`);
  Deno.exit(1);
}

for (const file of REQUIRED_FILES) {
  // exists() stats through symlinks, so a dangling LICENSE link fails here.
  if (!(await exists(file, { isFile: true }))) {
    console.error(`no ${file} in ${modDir}; every release must ship one`);
    Deno.exit(1);
  }
}

const archiveRoot = `${info.name}_${info.version}`;
const outPath = join(modDir, "build", `${archiveRoot}.zip`);

const entries: { name: string; data: Uint8Array<ArrayBuffer> }[] = [];

await addFile("info.json", "info.json");
for (const file of REQUIRED_FILES) await addFile(file, file);
await addTree("dist", ""); // tstl output flattened to archive root
for (const tree of OPTIONAL_TREES) await addTree(tree, tree);
for (const file of OPTIONAL_FILES) {
  if (await exists(file, { isFile: true })) await addFile(file, file);
}

await Deno.mkdir(dirname(outPath), { recursive: true });
await Deno.writeFile(outPath, await zip.create(entries));

console.log(`Packed ${entries.length} file(s) → ${relative(modDir, outPath)}`);

async function addFile(src: string, archivePath: string): Promise<void> {
  const data = await Deno.readFile(src);
  entries.push({
    name: `${archiveRoot}/${archivePath}`,
    data: data as Uint8Array<ArrayBuffer>,
  });
}

async function addTree(srcDir: string, archiveDir: string): Promise<void> {
  if (!(await exists(srcDir, { isDirectory: true }))) return;
  for await (const entry of walk(srcDir, { includeDirs: false })) {
    const rel = relative(srcDir, entry.path).replaceAll(SEPARATOR, "/");
    const archivePath = archiveDir ? `${archiveDir}/${rel}` : rel;
    await addFile(entry.path, archivePath);
  }
}
