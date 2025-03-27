"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLinkIcon, TrashIcon } from "lucide-react";
import { deleteWebsite } from "@/app/actions/websites";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Website } from "@/types/website";

interface WebsitesListProps {
  websites: Website[];
  variant?: "list" | "grid";
}

export function WebsitesList({ websites, variant = "list" }: WebsitesListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;

    const response = await deleteWebsite(id);
    
    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success("Website deleted successfully");
    router.refresh();
  };

  if (!websites.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No websites added yet.</p>
      </div>
    );
  }

  return (
    <div className={variant === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
      {websites.map((website) => (
        <Card key={website.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{website.name}</h3>
              <p className="text-sm text-gray-500">{website.domain}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href={website.domain} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(website.id)}
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          {variant === "grid" && website.visitors !== undefined && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visitors</p>
                <p className="font-medium">{website.visitors.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Page Views</p>
                <p className="font-medium">{website.pageViews?.toLocaleString() || 0}</p>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
 
