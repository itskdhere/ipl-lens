"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-dark.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground container mx-auto px-4 py-8">
      <SwaggerUI url="/api/docs/openapi.json" />
    </div>
  );
}
