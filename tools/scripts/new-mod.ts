/**
 * Scaffold a new Factorio mod inside this workspace.
 *
 *   deno task new <name> [--title "…"] [--author "…"] [--version 0.1.0]
 *                        [--factorio 2.0] [--description "…"]
 *
 * Creates <repo>/<name>/ with a tstl project targeting the Factorio runtime
 * stage, a changelog.txt, a LICENSE symlink to the repository-root LICENSE,
 * the mod portal metadata (release.json + README.md, see publish-mod.ts), and
 * registers it in the root deno.json workspaces array.
 */
import { parseArgs } from "@std/cli/parse-args";
import { ensureDir, exists } from "@std/fs";
import { dirname, fromFileUrl, join, resolve } from "@std/path";

const REPO_ROOT = resolve(dirname(fromFileUrl(import.meta.url)), "..", "..");
const MOD_NAME_RE = /^[A-Za-z][A-Za-z0-9_-]*$/;

const flags = parseArgs(Deno.args, {
  string: ["title", "author", "version", "factorio", "description"],
  default: { version: "0.1.0", factorio: "2.0" },
});

const name = String(flags._[0] ?? "").trim();
if (!name) {
  console.error(
    "usage: deno task new <name> [--title …] [--author …] [--version 0.1.0] [--factorio 2.0] [--description …]",
  );
  Deno.exit(2);
}
if (!MOD_NAME_RE.test(name)) {
  console.error(`invalid mod name '${name}': must match ${MOD_NAME_RE}`);
  Deno.exit(2);
}

const modDir = join(REPO_ROOT, name);
if (await exists(modDir)) {
  console.error(`refusing to overwrite existing path: ${modDir}`);
  Deno.exit(1);
}

const title = flags.title ?? name;
const author = flags.author ?? "unknown";
const description = flags.description ?? `${title} — a Factorio mod.`;

await ensureDir(join(modDir, "src"));

const info = {
  name,
  version: flags.version,
  title,
  author,
  description,
  factorio_version: flags.factorio,
  dependencies: ["base >= 2.0"],
};
await writeJson(join(modDir, "info.json"), info);

await Deno.writeTextFile(
  join(modDir, "changelog.txt"),
  `${"-".repeat(99)}
Version: ${flags.version}
Date: ${new Date().toISOString().slice(0, 10)}
  Added:
    - Initial version
`,
);

// Relative with "/" so the link committed to git resolves on every checkout.
await Deno.symlink("../LICENSE", join(modDir, "LICENSE"));

await writeJson(join(modDir, "release.json"), {
  category: "no-category",
  tags: [],
});

await Deno.writeTextFile(
  join(modDir, "README.md"),
  `# ${title}\n\n${description}\n`,
);

await writeJson(join(modDir, "deno.json"), {
  tasks: {
    build: "deno run -A npm:typescript-to-lua/tstl",
    clean: "rm -rf dist build",
    pack: "deno task build && deno run -A ../tools/scripts/pack-mod.ts",
  },
});

await writeJson(join(modDir, "tsconfig.json"), {
  extends: "../tsconfig.base.json",
  compilerOptions: {
    rootDir: "src",
    outDir: "dist",
    types: ["typed-factorio/runtime"],
  },
  include: ["src/**/*.ts"],
});

await Deno.writeTextFile(
  join(modDir, "src", "control.ts"),
  `script.on_init(() => {
  game.print("[${name}] loaded")
})
`,
);

const rootPath = join(REPO_ROOT, "deno.json");
const root = JSON.parse(await Deno.readTextFile(rootPath));
const members = new Set<string>(root.workspace ?? []);

members.add(`./${name}`);

root.workspace = [...members].sort();

await writeJson(rootPath, root);

console.log(
  `Created mod '${name}' at ${modDir}
Registered in workspace: ./${name}

Next steps:
  cd ${name}
  deno task build          # emits dist/control.lua
  # copy info.json + dist/*.lua into your Factorio mods folder
  # before the first release: set category/tags in release.json, write README.md`,
);

async function writeJson(path: string, value: unknown): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(value, null, 2) + "\n");
}
