"use client";

import { cn } from "@/lib/utils";
import type { Website } from "@databuddy/shared";
import { Globe } from "@phosphor-icons/react";

function WebsiteCard({ website, selected, onClick }: { website: Website, selected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-3 rounded border flex items-center gap-3 transition-colors",
                selected
                    ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                    : "bg-background/50 hover:bg-muted/80 border-border/50"
            )}
        >
            <Globe size={18} className="text-muted-foreground" />
            <div className="flex-1">
                <p className="font-medium text-sm">{website.name}</p>
                <p className="text-xs text-muted-foreground">{website.domain}</p>
            </div>
        </button>
    );
}

export function WebsiteSelector({ websites, selectedWebsite, onSelectWebsite }: { websites: Website[], selectedWebsite: string | null, onSelectWebsite: (id: string | null) => void }) {
    return (
        <div className="space-y-2 p-1 max-h-60 overflow-y-auto">
            {websites.length > 0 ? (
                websites.map((w) => (
                    <WebsiteCard
                        key={w.id}
                        website={w}
                        selected={selectedWebsite === w.id}
                        onClick={() => onSelectWebsite(w.id === selectedWebsite ? null : w.id)}
                    />
                ))
            ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                    No websites found.
                </div>
            )}
        </div>
    );
} 