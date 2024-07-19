import Link from "next/link";

export default function ApiPage({ params }: { params: { version: string } }) {
  return (
    <>
      <p>{params.version} API Root Page</p>
      <ul>
        <li>
          <Link href={`/docs/${params.version}/api/dispatcher`}>
            Dispatcher
          </Link>
        </li>
        <li>
          <Link href={`/docs/${params.version}/api/client`}>Client</Link>
        </li>
      </ul>
    </>
  );
}
