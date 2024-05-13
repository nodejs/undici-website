"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import GitHubLogoDark from '@/images/logos/github/github-dark.png'
import TwitterDark from '@/images/logos/twitter/twitter-dark.png'

export default function Navbar() {
    const pathname = usePathname();
    const routes = [
        {
            text: "docs",
            href: "/docs"
        },
        {
            text: "benchmarks",
            href: "/benchmarks"
        },
        {
            text: "examples",
            href: "/examples"
        }
    ];
    return (
        <header>
            <nav className="flex items-center justify-between border-b-2 border-green-700 px-2 py-4 font-semibold text-gray-900" aria-label="Global navigation">
                <div className="flex items-center gap-4">
                    <span>undici</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                    {routes.map(route => (
                        <Link key={route.text} href={route.href} className={pathname === route.href ? "text-green-700": ""}>
                            {route.text}
                        </Link>
                    ))}
                </div>
                <div className="flex gap-4 items-center">
                    <Link href="https://twitter.com/nodejs" target="_blank">
                        <Image className="h-5 w-5" src={TwitterDark} alt="Twitter Logo" />
                    </Link>
                    <Link href="https://github.com/nodejs/undici" target="_blank">
                        <Image className="h-6 w-6" src={GitHubLogoDark} alt="GitHub Logo" />
                    </Link>
                </div>
            </nav>
        </header>
    );
}
