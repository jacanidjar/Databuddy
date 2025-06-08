"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface CopyFieldProps {
  label: string;
  value: string;
  onCopy: () => void;
}

export function CopyField({ label, value, onCopy }: CopyFieldProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <code className="block p-2 sm:p-3 bg-muted/50 rounded text-xs sm:text-sm break-all flex-1 min-w-0">
          {value}
        </code>
        <Button size="sm" variant="outline" onClick={onCopy} className="flex-shrink-0">
          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Copy</span>
        </Button>
      </div>
    </div>
  );
} 