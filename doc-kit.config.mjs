import { join } from "node:path";
import { existsSync } from "node:fs";
import { major } from "semver";

const MAJOR_VERSION = `v${major(process.env.VERSION)}.x`;
const IS_LATEST = process.env.IS_LATEST === "true";

const ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';
const URL_PATH = IS_LATEST ? "/" : `/${MAJOR_VERSION}/`;

const BASE_URL = `${ORIGIN}${URL_PATH}`;

const typeMap = join(
  import.meta.dirname,
  "docs",
  MAJOR_VERSION,
  "type-map.json",
);
const hasLocalSiteConfig = existsSync(
  join(import.meta.dirname, "site.local.json"),
);

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
    project: "Node.js",
    title: "{project} Undici",
    useAbsoluteURLs: true,
    pageURL: "{baseURL}{path}.html",
    editURL: IS_LATEST
      ? "https://github.com/nodejs/undici/edit/main/docs/docs{path}.md"
      : undefined,

    // Imports
    imports: {
      "#theme/Footer": join(import.meta.dirname, "components/Footer.jsx"),
      "#theme/Navigation": join(import.meta.dirname, "components/NavBar.jsx"),
      "#theme/Sidebar": join(import.meta.dirname, "components/SideBar.jsx"),

      "#theme/local/site": hasLocalSiteConfig
        ? join(import.meta.dirname, "site.local.json")
        : join(import.meta.dirname, "site.json"),
      "#theme/site": join(import.meta.dirname, "site.json"),
    },
  },
  sitemap: {
    indexURL: "{baseURL}",
    pageURL: "{baseURL}{path}",
  },
};
