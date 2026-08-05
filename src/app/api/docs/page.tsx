"use client";

import { useState } from "react";
import SwaggerUI from "swagger-ui-react";
import { Button } from "@/components/ui/button";
import { IconDownload, IconCopy, IconCheck } from "@tabler/icons-react";

import "swagger-ui-react/swagger-ui.css";
import "./swagger-dark.css";

export default function ApiDocsPage() {
  const specUrl = "/api/docs/openapi.json";
  const [copied, setCopied] = useState(false);

  const handleCopySpecUrl = async () => {
    try {
      const fullUrl = `${window.location.origin}${specUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy spec URL:", err);
    }
  };

  const handleDownloadSpec = () => {
    const link = document.createElement("a");
    link.href = specUrl;
    link.download = "ipl-lens-openapi.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
      <div className="flex justify-center md:justify-end md:absolute md:top-11 md:right-6 z-10 gap-2 mb-4 md:mb-0">
        <Button variant="outline" size="sm" onClick={handleCopySpecUrl}>
          {copied ? (
            <IconCheck className="size-4 text-emerald-500 mr-1.5" />
          ) : (
            <IconCopy className="size-4 mr-1.5" />
          )}
          {copied ? "Copied!" : "Copy Spec URL"}
        </Button>

        <Button variant="default" size="sm" onClick={handleDownloadSpec}>
          <IconDownload className="size-4 mr-1.5" />
          Download JSON
        </Button>
      </div>

      <SwaggerUI url={specUrl} />
    </div>
  );
}
