import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";

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
    <html lang="en" className="bg-white">
      <body className={`mx-auto flex h-screen flex-col ${GeistSans.className}`}>
        <Navbar/>
        {children}
        <Footer />
      </body>
    </html>
  );
}
