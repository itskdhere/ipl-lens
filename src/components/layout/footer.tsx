import { IconBrandGithub } from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-4 text-center text-muted-foreground bg-background">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-1">
        <p className="text-center text-[13.5px]">
          &copy; {new Date().getFullYear()} IPL Lens. All rights reserved.
        </p>
        <a
          href="https://github.com/itskdhere/ipl-lens"
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-1"
        >
          <IconBrandGithub className="size-3.5 translate-y-[-0.75px]" />
          <span className="underline text-sm hover:text-accent-foreground/70">
            itskdhere/ipl-lens
          </span>
        </a>
      </div>
    </footer>
  );
}
