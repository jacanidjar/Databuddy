"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createWebsite } from "@/app/actions/websites";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

export function AddWebsiteDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const domain = formData.get("domain") as string;
    const name = formData.get("name") as string;

    if (!domain || !name) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const response = await createWebsite({ domain, name });
    
    if (response.error) {
      toast.error(response.error);
      setIsLoading(false);
      return;
    }
    
    setOpen(false);
    router.refresh();
    toast.success("Website added successfully");
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Website
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Website</DialogTitle>
          <DialogDescription>
            Add a new website to track with Databuddy
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Website Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Awesome Website"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              name="domain"
              type="url"
              placeholder="https://example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Website"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 