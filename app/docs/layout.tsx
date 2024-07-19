import Sidebar from "../components/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-full flex-row gap-4">
      <Sidebar pageName="Docs"/>
      <article className="prose">
      {children}
      </article>
    </main>
  );
}
