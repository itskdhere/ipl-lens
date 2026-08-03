import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Details",
  description: "Match Details for the IPL 2022 data analytics platform.",
};

export default function MatchDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
