import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";

export const metadata: Metadata = {
  title: "Node.js Undici",
  description: "An HTTP/1.1 client, written from scratch for Node.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`flex h-full flex-col gap-4 ${GeistSans.className}`}>
        <Navbar/>
        <Sidebar/>
        <main className="px-2">
          {children}
        </main>
      </body>
    </html>
  );
}
