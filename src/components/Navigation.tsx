"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, type Ref } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/programming", label: "Programming" },
  { href: "/games", label: "Games" },
  { href: "/music", label: "Music" },
  { href: "/about", label: "About" },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-center px-12 py-3 no-underline font-accent text-2xl transition-colors duration-500 ${
            pathname === item.href
              ? "text-neutral-600"
              : "text-neutral-900 hover:text-neutral-600"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

function HamburgerButton({
  isOpen,
  onToggle,
  ref,
}: {
  isOpen: boolean;
  onToggle: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      onClick={onToggle}
      aria-label="Toggle navigation menu"
      aria-expanded={isOpen}
      className="p-3 text-neutral-900 hover:text-neutral-600 transition-colors duration-300"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
          className="transition-transform duration-300"
          style={{
            transformOrigin: "12px 6px",
            transform: isOpen ? "translateY(6px) rotate(45deg)" : "none",
          }}
        />
        <line
          x1="3"
          y1="12"
          x2="21"
          y2="12"
          className="transition-opacity duration-300"
          style={{ opacity: isOpen ? 0 : 1 }}
        />
        <line
          x1="3"
          y1="18"
          x2="21"
          y2="18"
          className="transition-transform duration-300"
          style={{
            transformOrigin: "12px 18px",
            transform: isOpen ? "translateY(-6px) rotate(-45deg)" : "none",
          }}
        />
      </svg>
    </button>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <nav className="relative pb-12">
      {/* Desktop nav */}
      <div className="hidden md:flex flex-wrap justify-center">
        <NavLinks />
      </div>

      {/* Mobile hamburger button */}
      <div className="flex md:hidden justify-center">
        <HamburgerButton
          ref={buttonRef}
          isOpen={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
        />
      </div>

      {/* Mobile slide-down menu */}
      <div
        ref={menuRef}
        className="md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${navItems.length * 4}rem` : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center">
          <NavLinks />
        </div>
      </div>
    </nav>
  );
}
