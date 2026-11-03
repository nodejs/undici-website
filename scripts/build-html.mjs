import { execFile } from "node:child_process";
import { readFile, cp } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { major } from "semver";

const ROOT = join(import.meta.dirname, "..");

const execFileAsync = promisify(execFile);

const versions = JSON.parse(await readFile(join(ROOT, "versions.json"), "utf8"));

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

  const isLatest = version === versions[0];
  const majorVersion = `v${major(version)}.x`;
  const urlPath = isLatest ? "" : majorVersion;

  await cp(
    join(ROOT, "docs", majorVersion),
    join(ROOT, "out", urlPath),
    {
      recursive: true,
      filter: (src) => statSync(src).isDirectory() || src.endsWith(".md"),
    },
  );
}

