import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swagger UI",
  description:
    "Interactive OpenAPI (Swagger) documentation and API reference for the IPL 2022 data analytics platform.",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
