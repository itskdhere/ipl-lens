import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "H2H Matchups",
  description: "H2H Matchups for the IPL 2022 data analytics platform.",
};

export default function MatchupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
