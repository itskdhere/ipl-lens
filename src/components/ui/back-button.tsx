"use client";

import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";

export function BackButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="gap-1.5 text-xs"
    >
      <IconArrowLeft className="h-3.5 w-3.5" />
      Go Back
    </Button>
  );
}
