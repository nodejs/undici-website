import Link from "next/link";

export default function DocsPage() {
  return (
    <>
      <p>Docs Home Page</p>
      <ul>
        <li>
          <Link href="docs/latest/api">Latest API Docs</Link>
        </li>
        <li>
          <Link href="docs/v6/api">v6 API Docs</Link>
        </li>
        <li>
          <Link href="docs/v5/api">v5 API Docs</Link>
        </li>
      </ul>
    </>
  );
}
