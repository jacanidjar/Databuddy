"use client";

import { useWebsiteTransfer } from "@/hooks/use-website-transfer";
import { WebsiteSelector } from "./website-selector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, User, Buildings } from "@phosphor-icons/react";

export function TransferAssets({ organizationId }: { organizationId: string }) {
    const { personalWebsites, organizationWebsites, transferWebsite, isTransferring, isLoading } = useWebsiteTransfer(organizationId);
    const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

    const selectedSide = personalWebsites.some(w => w.id === selectedWebsite)
        ? 'personal'
        : organizationWebsites.some(w => w.id === selectedWebsite)
            ? 'organization'
            : null;

    const handleTransfer = () => {
        if (!selectedWebsite || !selectedSide) return;

        const destination = selectedSide === "personal"
            ? { organizationId: organizationId }
            : { organizationId: null };

        transferWebsite({ websiteId: selectedWebsite, destination }, {
            onSuccess: () => {
                setSelectedWebsite(null);
            }
        });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-40"><Spinner /></div>
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Personal Websites */}
                <div className="flex flex-col gap-2 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={16} />
                        <h4 className="font-semibold">Your Websites</h4>
                    </div>
                    <WebsiteSelector
                        websites={personalWebsites}
                        selectedWebsite={selectedWebsite}
                        onSelectWebsite={setSelectedWebsite}
                    />
                </div>

                <div className="flex items-center justify-center">
                    <Button onClick={handleTransfer} disabled={!selectedSide || isTransferring} size="icon" variant="outline">
                        <ArrowRight />
                    </Button>
                </div>

                {/* Organization Websites */}
                <div className="flex flex-col gap-2 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                        <Buildings size={16} />
                        <h4 className="font-semibold">Organization Websites</h4>
                    </div>
                    <WebsiteSelector
                        websites={organizationWebsites}
                        selectedWebsite={selectedWebsite}
                        onSelectWebsite={setSelectedWebsite}
                    />
                </div>
            </div>
        </div>
    );
} 