import { notFound } from "next/navigation";

const VERSIONS = ["latest", "v6", "v5"];

export default function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: any;
}>) {
  if (!VERSIONS.includes(params.version)) {
    return notFound();
  }
  return <div className="docs-post">{children}</div>;
}

// This seems trivial, but is important for statically generating our various documentation pages at build time dramatically improving the runtime performance of the site.
export function generateStaticParams() {
    return VERSIONS.map(version => ({ version }))
}
