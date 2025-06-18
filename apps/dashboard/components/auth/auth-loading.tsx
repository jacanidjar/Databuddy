import { SpinnerIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface AuthLoadingProps {
  className?: string;
}

export function AuthLoading({ className }: AuthLoadingProps) {
  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20", className)}>
      <div className="relative flex flex-col items-center gap-6">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl animate-pulse" />

        {/* Main spinner container */}
        <div className="relative flex items-center justify-center">
          {/* Background circle */}
          <div className="absolute h-20 w-20 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 animate-ping" />

          {/* Spinner */}
          <SpinnerIcon
            className="h-12 w-12 animate-spin text-primary drop-shadow-lg"
          />
        </div>

        {/* Loading text with gradient */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-xl font-semibold text-transparent">
            Loading your experience
          </h2>
          <div className="flex items-center gap-1">
            <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" />
          </div>
        </div>

        {/* Subtle progress bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}