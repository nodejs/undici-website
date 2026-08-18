import { execFile } from "node:child_process";
import { readFile, cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { major } from "semver";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const execFileAsync = promisify(execFile);

const versions = JSON.parse(await readFile("./versions.json"));

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
      "-t",
      "llms-txt",
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

  const majorVersion = `v${major(version)}.x`;
  const versionDirectory = version === versions[0] ? "" : majorVersion;

  // Keep a root-level copy for the rewrite in vercel.json because Vercel's
  // preview deployment returns 404 for nested versioned llms.txt files.
  await cp(
    join("out", versionDirectory, "llms.txt"),
    join("out", `llms-${majorVersion}.txt`),
  );
}
