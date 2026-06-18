import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { major } from "semver";

const REPO = "nodejs/undici";
const ROOT = join(import.meta.dirname, "..");
const VERSIONS_FILE = join(ROOT, "versions.json");
const DOCS_DIR = join(ROOT, "docs");
const SITE_CONFIG_URL =
  "https://raw.githubusercontent.com/nodejs/learn/main/site.json";
const CONCURRENCY = 10;

// A token is optional, but lifts the unauthenticated 60 req/hour API limit.
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const apiHeaders = { ...headers, Accept: "application/vnd.github+json" };

/** Encode a repo-relative path for use in a URL while keeping the slashes. */
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

/** Fetch with a descriptive error on non-2xx responses. */
async function fetchOk(url, options, label) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${label} ${res.status} ${res.statusText} for ${url}`);
  }
  return res;
}

/** Fetch and parse JSON from the GitHub REST API. */
async function fetchJSON(url) {
  const res = await fetchOk(url, { headers: apiHeaders }, "GitHub API");
  return res.json();
}

/** Download a single file at a tag as raw bytes (preserves binary assets). */
async function fetchFile(tag, path) {
  const url = `https://raw.githubusercontent.com/${REPO}/${encodePath(tag)}/${encodePath(path)}`;
  const res = await fetchOk(url, { headers }, "Download");
  return Buffer.from(await res.arrayBuffer());
}

/** Run `task` over `items` with a bounded number of concurrent workers. */
async function eachLimit(items, limit, task) {
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      await task(items[cursor++]);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
}

async function fetchDocsForTag(tag) {
  const versionPath = `${major(tag)}.x`;
  const outDir = join(DOCS_DIR, `v${versionPath}`);

  // One recursive tree call lists every file in the tag.
  const { tree, truncated } = await fetchJSON(
    `https://api.github.com/repos/${REPO}/git/trees/${encodeURIComponent(tag)}?recursive=1`,
  );
  if (truncated) {
    throw new Error(`Tree for ${tag} was truncated; cannot mirror docs reliably`);
  }

  const blobs = tree.filter((node) => node.type === "blob");
  const docsFiles = blobs.filter((node) => node.path.startsWith("docs/"));

  // Newer releases (v6+) nest the real docs under docs/docs; older ones use docs/.
  const sourceRoot = docsFiles.some((node) => node.path.startsWith("docs/docs/"))
    ? "docs/docs/"
    : "docs/";
  const files = docsFiles.filter((node) => node.path.startsWith(sourceRoot));

  if (files.length === 0) {
    throw new Error(`No docs found under ${sourceRoot} for ${tag}`);
  }

  // Replace any previous output so removed upstream files don't linger.
  await rm(outDir, { recursive: true, force: true });

  // mkdir with recursive is safe to call concurrently for the same dir.
  await eachLimit(files, CONCURRENCY, async (node) => {
    const dest = join(outDir, node.path.slice(sourceRoot.length));
    const content = await fetchFile(tag, node.path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, content);
  });

  // Finally, put the README in the root of the docs for the index page.
  const readmeNode = blobs.find(
    (node) => node.path.toLowerCase() === "readme.md",
  );
  if (readmeNode) {
    const readmeContent = await fetchFile(tag, readmeNode.path);
    await writeFile(join(outDir, "index.md"), readmeContent);
  }

  console.log(
    `${tag} → docs/v${versionPath}/ (${files.length} files from ${sourceRoot})`,
  );
}

async function updateTypeMap(tag) {
  const versionPath = `${major(tag)}.x`;
  const typeMapPath = join(DOCS_DIR, `v${versionPath}`, "type-map.json");

  let content;
  try {
    content = JSON.parse(await readFile(typeMapPath, "utf8"));
  } catch (err) {
    if (err?.code === "ENOENT") {
      console.warn(`No type-map.json found for ${tag}, skipping link update.`);
      return;
    }
    throw err;
  }

  let changed = false;
  for (const [key, value] of Object.entries(content)) {
    if (typeof value === "string" && value.startsWith("/")) {
      content[key] = `/${versionPath}${value}`;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(typeMapPath, `${JSON.stringify(content, null, 2)}\n`);
  }
}

async function fetchSiteConfig() {
  const res = await fetchOk(SITE_CONFIG_URL, { headers }, "Site config");
  const json = await res.json();

  json.sidebar = [];
  for (const item of json.navigation) {
    item.link = new URL(item.link, "https://nodejs.org").href;
  }

  await writeFile(join(ROOT, "site.json"), JSON.stringify(json, null, 2));
}

const versions = JSON.parse(await readFile(VERSIONS_FILE, "utf8"));

await Promise.all(versions.map(fetchDocsForTag));
await Promise.all(versions.slice(1).map(updateTypeMap));

await fetchSiteConfig();

console.log(`Fetched docs for ${versions.length} version(s).`);