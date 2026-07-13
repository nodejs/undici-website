# undici-website

The source for the [Undici](https://github.com/nodejs/undici) documentation
website. It builds multi-version, static API documentation for Undici — the
HTTP/1.1 client written from scratch for Node.js.

The site pulls the Markdown docs straight from the `nodejs/undici` repository at
each supported release tag and renders them into static HTML with
[`@node-core/doc-kit`](https://www.npmjs.com/package/@node-core/doc-kit), the
same documentation toolchain used across the Node.js project. The latest major
version is served at the site root (`/`); older majors live under a versioned
path (e.g. `/v7.x/`).

## Getting started

Requires a current LTS release of Node.js.

```bash
# Install dependencies
npm ci

# Fetch the Undici docs and build the static site into ./out
npm run build
```

### Scripts

| Script                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `npm run build:fetch-docs` | Fetch the Undici Markdown docs for each supported version |
| `npm run build:html`       | Generate the static site and `llms.txt` with doc-kit       |
| `npm run build`            | Fetch the docs, then generate all published output         |

The build is driven by a couple of environment variables consumed in
[`doc-kit.config.mjs`](doc-kit.config.mjs):

- `VERSION` — the Undici version being built (e.g. `v8.5.0`)
- `IS_LATEST` — `"true"` when building the newest major (served at `/`)

## How it works

The site has no content of its own. Every build mirrors the documentation from
the [`nodejs/undici`](https://github.com/nodejs/undici) repository at the exact
release tags listed in [`versions.json`](versions.json), then renders each one
into a static, versioned site. `npm run build` runs the two stages below in
order.

### 1. Fetching the docs ([`scripts/fetch-undici-docs.mjs`](scripts/fetch-undici-docs.mjs))

For each tag in `versions.json`, the fetch script mirrors that release's docs
straight from GitHub — no clone, no checkout:

1. **List the files.** It calls the GitHub Git Trees API once per tag
   (`git/trees/<tag>?recursive=1`) to enumerate every file in the release, and
   bails out if the API reports the tree was `truncated` (so docs are never
   silently mirrored only in part).
2. **Locate the docs.** It keeps the `blob` entries under `docs/`, then adapts to
   layout drift between releases: newer majors (v6+) nest the real docs under
   `docs/docs/`, while older ones keep them directly in `docs/`. The deeper path
   wins when present.
3. **Download in parallel.** The previous output directory is removed first (so
   files deleted upstream don't linger), then each file is downloaded as raw
   bytes from `raw.githubusercontent.com` at the tag — preserving binary assets
   — through a bounded pool of 10 concurrent workers.
4. **Lay it out by major version.** Files are written to `docs/v<major>.x/`, with
   the source-root prefix stripped. The release's top-level `README.md` is also
   copied in as `index.md` to serve as that version's landing page.

It also pulls the shared navigation/footer config (`site.json`) from
[`nodejs/learn`](https://github.com/nodejs/learn) and rewrites the navigation
links to absolute `nodejs.org` URLs so the chrome matches the rest of the
Node.js site.

> An optional `GITHUB_TOKEN` (or `GH_TOKEN`) environment variable is used for
> authentication when present. It isn't required, but it lifts GitHub's
> unauthenticated rate limit of 60 requests/hour — useful when fetching many
> versions.

### 2. Building the HTML ([`scripts/build-html.mjs`](scripts/build-html.mjs))

The build script iterates the same `versions.json` list and invokes doc-kit once
per version:

```
npx -p @node-core/doc-kit doc-kit generate \
  -t web -t orama-db -t legacy-json -t llms-txt \
  --config-file ./doc-kit.config.mjs
```

Each invocation runs with `VERSION` set to the current tag and `IS_LATEST` set to
`true` only for the first (newest) entry. [`doc-kit.config.mjs`](doc-kit.config.mjs)
reads those variables to decide:

- **Output path & routing** — the latest major builds to `out/` and is served at
  the root (`/`); every other major builds to `out/v<major>.x/` and is served
  under that path.
- **Generated targets** — `web` (the static HTML), `orama-db` (the client-side
  search index), `legacy-json` (the legacy JSON API docs), and `llms-txt` (an
  agent-readable index of the documentation). The index/all/404 helper pages
  are only generated for the latest version.
- **Theme & edit links** — custom `NavBar`, `Footer`, and `Sidebar` components
  are wired in, and "edit this page" links point back to the source Markdown in
  `nodejs/undici` (latest only).

The `llms-txt` target uses [`llms-template.txt`](llms-template.txt) for the
Undici-specific introduction and writes `llms.txt` alongside each version's
HTML output. Its links use the same case-sensitive routes as the generated
site. The combined `out/` tree is what Vercel publishes (see
[`vercel.json`](vercel.json)).

### Adding or bumping a version

[`scripts/update-versions.mjs`](scripts/update-versions.mjs) keeps
`versions.json` current. Given a release tag, it validates the semver, then
either replaces the existing entry for that major or prepends a new one (new
majors become the latest):

```bash
node scripts/update-versions.mjs v8.6.0
```

This is what the [release workflow](.github/workflows/release.yml) runs to open
an automated PR when a new Undici version ships.

## Project structure

| Path                                       | Purpose                                                              |
| ------------------------------------------ | -------------------------------------------------------------------- |
| [`components/`](components/)               | Custom theme components (`NavBar`, `Footer`, `SideBar`)              |
| [`scripts/`](scripts/)                     | Build automation (fetch docs, build HTML, update versions)           |
| [`doc-kit.config.mjs`](doc-kit.config.mjs) | doc-kit configuration: input/output, routing, theme imports          |
| [`llms-template.txt`](llms-template.txt)   | Undici-specific header used for the generated `llms.txt`             |
| [`versions.json`](versions.json)           | The list of Undici versions that get documented                      |
| [`vercel.json`](vercel.json)               | Vercel deployment configuration                                      |
| `docs/`                                    | Markdown docs per major version (fetched at build time, git-ignored) |
| `out/`                                     | Generated static HTML (build output, git-ignored)                    |

## Supported versions

The documented versions are listed in [`versions.json`](versions.json) and kept
up to date by [`scripts/update-versions.mjs`](scripts/update-versions.mjs). When
a new Undici release is published, the
[release workflow](.github/workflows/release.yml) updates this list and opens a
pull request automatically.

## Contributing

The documentation content itself lives in the
[`nodejs/undici`](https://github.com/nodejs/undici) repository under `docs/` —
edit it there. This repository only contains the tooling that builds and
publishes the website, so changes here should target the build scripts, theme
components, or site configuration.
