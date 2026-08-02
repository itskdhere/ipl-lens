"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <SwaggerUI url="/api/docs/openapi.json" />
    </div>
  );
}
