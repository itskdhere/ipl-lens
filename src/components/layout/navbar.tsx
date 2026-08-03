"use client";

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

          <Link href="/api/docs" target="_blank">
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-1.5 font-mono text-xs"
            >
              <IconFileCode className="h-3.5 w-3.5" />
              <span>API Docs</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
