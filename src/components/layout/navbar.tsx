"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  IconLayoutDashboard,
  IconCricket,
  IconUser,
  IconSwords,
  IconFileCode,
  IconSun,
  IconMoon,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: IconLayoutDashboard,
    external: false,
  },
  { href: "/matches", label: "Matches", icon: IconCricket, external: false },
  { href: "/players", label: "Players", icon: IconUser, external: false },
  {
    href: "/matchups",
    label: "H2H Matchup",
    icon: IconSwords,
    external: false,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            priority
            src="/icon.png"
            alt="IPL Lens Logo"
            width={28}
            height={28}
            className="size-7 object-contain group-hover:opacity-90"
          />
          <p className="font-heading font-extrabold text-lg tracking-tight text-foreground group-hover:opacity-90">
            IPL Lens
          </p>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              !item.external &&
              (item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <IconSun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-600" />
            <IconMoon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
          </Button>

          <Link href="/api/docs" className="hidden md:inline-flex">
            <Button
              variant="outline"
              className="flex items-center gap-1.5 font-mono text-xs"
            >
              <IconFileCode className="h-3.5 w-3.5" />
              <span>API Docs</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <IconX className="size-5" />
            ) : (
              <IconMenu2 className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/50 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 right-0 w-full z-50 md:hidden border-b border-border/80 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-3 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  !item.external &&
                  (item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2 border-t border-border/60">
              <Link
                href="/api/docs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-mono"
              >
                <IconFileCode className="h-4 w-4 text-primary" />
                <span>API Docs</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
