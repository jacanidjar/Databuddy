'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle, AlertCircle, Play, Pause, Heart } from "lucide-react";
import { toast } from "sonner";
import { deleteWebsite, updateWebsiteStatus } from "../actions";
import { useState } from "react";
import { DeleteDialog } from "./delete-dialog";
import { TransferWebsiteForm } from "./transfer-website-form";

interface Website {
  id: string;
  name: string | null;
  domain: string;
  status: 'ACTIVE' | 'HEALTHY' | 'UNHEALTHY' | 'INACTIVE' | 'PENDING';
  createdAt: string;
}

export function WebsiteActions({ website }: { website: Website }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteWebsite(website.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Website deleted successfully');
    }
  };

  const handleStatusUpdate = async (status: 'ACTIVE' | 'HEALTHY' | 'UNHEALTHY' | 'INACTIVE' | 'PENDING') => {
    const result = await updateWebsiteStatus(website.id, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Website status updated to ${status.toLowerCase()}`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Website Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate('HEALTHY')}
            disabled={website.status === 'HEALTHY'}
            className="text-green-600 focus:bg-green-500/10 focus:text-green-600 dark:focus:bg-green-500/20 dark:focus:text-green-500"
          >
            <Heart className="mr-2 h-4 w-4" />
            Mark as Healthy
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate('ACTIVE')}
            disabled={website.status === 'ACTIVE'}
          >
            <Play className="mr-2 h-4 w-4" />
            Mark as Active
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate('PENDING')}
            disabled={website.status === 'PENDING'}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Mark as Pending
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate('UNHEALTHY')}
            disabled={website.status === 'UNHEALTHY'}
            className="text-yellow-600 focus:bg-yellow-500/10 focus:text-yellow-600 dark:focus:bg-yellow-500/20 dark:focus:text-yellow-500"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Mark as Unhealthy
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate('INACTIVE')}
            disabled={website.status === 'INACTIVE'}
            className="text-gray-600 focus:bg-gray-500/10 focus:text-gray-600 dark:focus:bg-gray-500/20 dark:focus:text-gray-500"
          >
            <Pause className="mr-2 h-4 w-4" />
            Mark as Inactive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="cursor-not-allowed">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Website (Soon)
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TransferWebsiteForm website={website} />
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:focus:bg-red-500/20 dark:focus:text-red-500"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Website
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Website"
        description={`Are you sure you want to delete ${website.name || website.domain}? This action cannot be undone.`}
      />
    </>
  );
} 