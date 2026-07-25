import { execFile } from "node:child_process";
import { readFile, cp, stat } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { major } from "semver";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const execFileAsync = promisify(execFile);

const versions = JSON.parse(await readFile("./versions.json"));

const isMarkdownOrDirectory = async (path) =>
  (await stat(path)).isDirectory() || extname(path) === ".md";

const runDocKit = (version) =>
  execFileAsync(
    "npx",
    [
      "-p",
      "@node-core/doc-kit",
      "doc-kit",
      "generate",
      "-t",
      "web",
      "-t",
      "orama-db",
      "-t",
      "legacy-json",
      "--config-file",
      "./doc-kit.config.mjs",
    ],
    {
      env: {
        ...process.env,
        VERSION: version,
        IS_LATEST: version === versions[0],
      },
      shell: true,
    },
  );

for (const version of versions) {
  await runDocKit(version);

  const versionPath = `v${major(version)}.x`;
  const outputPath = join("out", versionPath);

  await cp(join("docs", versionPath), outputPath, {
    recursive: true,
    filter: isMarkdownOrDirectory,
  });
}
