export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="px-2">
      <p>Docs Layout</p>
      {children}
    </div>
  );
}
