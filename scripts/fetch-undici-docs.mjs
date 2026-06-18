import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { major } from "semver";

const REPO = "nodejs/undici";
const ROOT = join(import.meta.dirname, "..");
const VERSIONS_FILE = join(ROOT, "versions.json");
const DOCS_DIR = join(ROOT, "docs");
const CONCURRENCY = 10;

// A token is optional, but lifts the unauthenticated 60 req/hour API limit.
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const headers = {
  ...(token && { Authorization: `Bearer ${token}` }),
};

/** Encode a repo-relative path for use in a URL while keeping the slashes. */
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

/** Fetch and parse JSON from the GitHub REST API. */
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { ...headers, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

/** Download a single file at a tag as raw bytes (preserves binary assets). */
async function fetchFile(tag, path) {
  const url = `https://raw.githubusercontent.com/${REPO}/${encodePath(tag)}/${encodePath(path)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Download ${res.status} ${res.statusText} for ${url}`);
  }
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
  const majorVersion = `v${major(tag)}.x`;
  const outDir = join(DOCS_DIR, majorVersion);

  // One recursive tree call lists every file in the tag.
  const { tree, truncated } = await fetchJSON(
    `https://api.github.com/repos/${REPO}/git/trees/${encodeURIComponent(tag)}?recursive=1`,
  );
  if (truncated) {
    throw new Error(
      `Tree for ${tag} was truncated; cannot mirror docs reliably`,
    );
  }

  const docsFiles = tree.filter(
    (node) => node.type === "blob" && node.path.startsWith("docs/"),
  );

  // Newer releases (v6+) nest the real docs under docs/docs; older ones use docs/.
  const nested = docsFiles.some((node) => node.path.startsWith("docs/docs/"));
  const sourceRoot = nested ? "docs/docs/" : "docs/";
  const files = docsFiles.filter((node) => node.path.startsWith(sourceRoot));

  if (files.length === 0) {
    throw new Error(`No docs found under ${sourceRoot} for ${tag}`);
  }

  // Replace any previous output so removed upstream files don't linger.
  await rm(outDir, { recursive: true, force: true });

  await eachLimit(files, CONCURRENCY, async (node) => {
    const dest = join(outDir, node.path.slice(sourceRoot.length));
    const content = await fetchFile(tag, node.path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, content);
  });

  // Finally, put the README in the root of the docs for the index page.
  const readmeNode = tree.find(
    (node) => node.type === "blob" && node.path.toLowerCase() === "readme.md",
  );
  if (readmeNode) {
    const readmeContent = await fetchFile(tag, readmeNode.path);
    await writeFile(join(outDir, "index.md"), readmeContent);
  }

  console.log(
    `${tag} → docs/${majorVersion}/ (${files.length} files from ${sourceRoot})`,
  );
}

async function fetchSiteConfig() {
  const url = `https://raw.githubusercontent.com/nodejs/learn/main/site.json`;
  const res = await fetch(url, { headers });
  const json = await res.json();
  json.sidebar = [];
  json.navigation.forEach((item) => {
    item.link = new URL(item.link, "https://nodejs.org").href;
  });

  await writeFile(join(ROOT, "site.json"), JSON.stringify(json, null, 2));
}

const versions = JSON.parse(await readFile(VERSIONS_FILE, "utf8"));

for (const tag of versions) {
  await fetchDocsForTag(tag);
}

fetchSiteConfig();

console.log(`Fetched docs for ${versions.length} version(s).`);
