import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Details",
  description: "Player Details for the IPL 2022 data analytics platform.",
};

export default function PlayerDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
