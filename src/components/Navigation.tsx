"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/programming", label: "Programming" },
  { href: "/games", label: "Games" },
  { href: "/music", label: "Music" },
  { href: "/about", label: "About" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="overflow-hidden flex flex-col md:flex-row flex-wrap justify-center pb-12">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-center px-12 py-4 no-underline font-accent text-3xl transition-colors duration-500 ${
            pathname === item.href
              ? "text-neutral-600"
              : "text-neutral-900 hover:text-neutral-600"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
