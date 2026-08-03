import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Players Directory",
    template: "%s | IPL Lens",
  },
  description: "Players Directory for the IPL 2022 data analytics platform.",
};

export default function PlayersDirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
