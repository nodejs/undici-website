import { join } from "node:path";
import { existsSync } from "node:fs";
import { major } from "semver";

const MAJOR_VERSION = `v${major(process.env.VERSION)}.x`;
const IS_LATEST = process.env.IS_LATEST === "true";

const ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
const URL_PATH = IS_LATEST ? "/" : `/${MAJOR_VERSION}/`;

const BASE_URL = `${ORIGIN}${URL_PATH}`;

const description = "An HTTP/1.1 client, written from scratch for Node.js.";

const versionRoot = join(import.meta.dirname, "docs", MAJOR_VERSION);
const typeMap = join(versionRoot, "type-map.json");
const localSiteConfig = join(versionRoot, "site.json");

/** @type {import('@node-core/doc-kit/src/utils/configuration/types.d.ts').Configuration} */
export default {
  global: {
    output: join(import.meta.dirname, "out", URL_PATH),
    input: [`docs/${MAJOR_VERSION}/**/*.md`],
    repository: "nodejs/undici",
    baseURL: BASE_URL,
    version: process.env.VERSION,
  },
  metadata: {
    typeMap: existsSync(typeMap) ? typeMap : undefined,
  },
  "jsx-ast": {
    generateIndexPage: false,
    generateAllPage: false,
    generate404Page: IS_LATEST,
  },
  web: {
    // Important Configuration
    project: "Undici",
    title: "Node.js {project}",
    useAbsoluteURLs: true,
    pageURL: "{baseURL}{path}.html",
    editURL: IS_LATEST
      ? "https://github.com/nodejs/undici/edit/main/docs/docs{path}.md"
      : undefined,
    templatePath: join(import.meta.dirname, 'template.html'),

    // Metadata
    head: {
      meta: [
        {
          name: "description",
          content: description,
        },
        {
          name: "og:description",
          content: description,
        },
        {
          name: "og:image",
          content: `https://nodejs.org/en/next-data/og/announcement/${encodeURIComponent(`Undici - ${description}`)}.png`,
        }
      ],
    },

    // Imports
    imports: {
      "#theme/Footer": join(import.meta.dirname, "components/Footer.jsx"),
      "#theme/Navigation": join(import.meta.dirname, "components/NavBar.jsx"),
      "#theme/Sidebar": join(import.meta.dirname, "components/SideBar.jsx"),

      "#theme/local/site": existsSync(localSiteConfig)
        ? localSiteConfig
        : join(import.meta.dirname, "site.json"),
      "#theme/site": join(import.meta.dirname, "site.json"),
    },
  },
  sitemap: {
    indexURL: "{baseURL}",
    pageURL: "{baseURL}{path}",
  },
};
