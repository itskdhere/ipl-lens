import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { IconAlertCircle, IconLayoutDashboard } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
};

export default function NotFound() {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center space-y-8 py-12">
      <div className="relative flex flex-col items-center space-y-4 max-w-2xl">
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 dark:bg-primary/20 blur-3xl rounded-full pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="flex items-center gap-2">
          <Badge
            variant="destructive"
            className="font-mono text-xs px-3 py-1 tracking-wider flex items-center gap-1.5"
          >
            <IconAlertCircle className="h-3.5 w-3.5" />
            DRS: Out of Bounds
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 select-none py-2">
          <span className="font-heading font-black text-6xl sm:text-8xl tracking-tight text-foreground">
            4
          </span>
          <Image
            priority
            src="/icon.png"
            alt="IPL Lens Logo"
            width={72}
            height={72}
            className="size-14 sm:size-20 object-contain mx-1 animate-flicker"
          />
          <span className="font-heading font-black text-6xl sm:text-8xl tracking-tight text-foreground">
            4
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
            Clean Bowled! Page Not Found.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            The delivery landed outside the line. The route or resource you were
            searching for has been dismissed or moved to another venue.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <BackButton />
        <Link href="/dashboard">
          <Button className="gap-1.5 text-xs font-semibold">
            <IconLayoutDashboard className="h-3.5 w-3.5" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </main>
  );
}
