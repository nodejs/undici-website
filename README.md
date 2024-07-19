# undici.nodejs.org

The ~official~ **work in progress** documentation site for [undici](https://github.com/nodejs/undici).

## Getting Started

> ⚠️ This repository uses specific Node.js and pnpm versions. Use a Node.js version manager such as [fnm](https://github.com/Schniz/fnm) and a package manager version manager such as [corepack](https://nodejs.org/api/corepack.html) to ensure compatibility.

```sh
# Clone
git clone git@github.com:Ethan-Arrowood/undici.nodejs.org.git
# Set current directory
cd undici.nodejs.org
# Set Node version
fnm use 20.11.1
# Set pnpm version
corepack enable # or manually `npm i -g pnpm@8.15.5`
# Install dependencies
pnpm install
# Run development server
pnpm dev
```

## Site Organization

This site makes heavy use of Next.js App Router file-system based routing.

It uses [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) for the versioned documentation feature. The API documentation is preceded by a `[version]` dynamic route. The relative directory ([`app/docs/[version]/`](./app/docs/[version]/)) contains a `layout.tsx` file that contains a conditional check on the `version` parameter. If it does not match one of the specified values, the user will be navigated to a 404 page. Importantly, a `page.tsx` is not specified for the `[version]` dynamic endpoint. Thus, if the user only navigates to `docs/latest`, they will reach a 404 page too. They must navigate to the `docs/<version>/api` endpoint to see the root level API documentation for the specified version.

The version parameter is available on all nested pages automatically. This means, that even if we had `docs/latest/api/foo/bar/fuzz/buzz`, the `page.tsx` within `buzz`, can simply access `params.version` and it would return `latest`.

Furthermore, this applies to all MDX pages as well. For example, `docs/[version]/api/dispatcher/page.mdx` can access the value via `{props.params.version}`. The page can then use this value to render things conditionally, or pass it down to any other components (including other MDX ones)! Using this feature, we can make our documentation dynamically change based on the version specified!

## Maintainers

- [@Ethan-Arrowood](https://github.com/Ethan-Arrowood)
