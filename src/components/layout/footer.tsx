import { IconBrandGithub } from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-2 sm:py-3 text-center text-[13px] text-muted-foreground bg-muted/20">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-1">
        <p className="text-center">
          &copy; {new Date().getFullYear()} IPL Lens. All rights reserved.
        </p>
        <a
          href="https://github.com/itskdhere/IPL-Lens"
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-1"
        >
          <IconBrandGithub className="size-3.25 translate-y-[-0.5px]" />
          <span className="underline hover:text-accent-foreground/70">
            itskdhere/IPL-Lens
          </span>
        </a>
      </div>
    </footer>
  );
}
