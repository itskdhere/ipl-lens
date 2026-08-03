import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Match Explorer",
    template: "%s | IPL Lens",
  },
  description: "Match Explorer for the IPL 2022 data analytics platform.",
};

export default function MatchExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
