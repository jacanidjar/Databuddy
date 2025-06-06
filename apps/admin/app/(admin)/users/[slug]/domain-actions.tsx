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
import { MoreHorizontal, Pencil, Trash2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { deleteDomain, updateDomainVerification } from "../actions";
import { useState } from "react";
import { DeleteDialog } from "./delete-dialog";
import { TransferDomainForm } from "./transfer-domain-form";

interface Domain {
  id: string;
  name: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  verifiedAt: string | null;
  createdAt: string;
}

export function DomainActions({ domain }: { domain: Domain }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteDomain(domain.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Domain deleted successfully');
    }
  };

  const handleVerificationUpdate = async (status: 'PENDING' | 'VERIFIED' | 'FAILED') => {
    const result = await updateDomainVerification(domain.id, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Domain verification status updated to ${status.toLowerCase()}`);
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
            <span className="sr-only">Domain Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Verification Status</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleVerificationUpdate('VERIFIED')}
            disabled={domain.verificationStatus === 'VERIFIED'}
            className="text-green-600 focus:bg-green-500/10 focus:text-green-600 dark:focus:bg-green-500/20 dark:focus:text-green-500"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Verified
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleVerificationUpdate('PENDING')}
            disabled={domain.verificationStatus === 'PENDING'}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Mark as Pending
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleVerificationUpdate('FAILED')}
            disabled={domain.verificationStatus === 'FAILED'}
            className="text-yellow-600 focus:bg-yellow-500/10 focus:text-yellow-600 dark:focus:bg-yellow-500/20 dark:focus:text-yellow-500"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Mark as Failed
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="cursor-not-allowed">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Domain (Soon)
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TransferDomainForm domain={domain} />
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:focus:bg-red-500/20 dark:focus:text-red-500"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Domain
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Domain"
        description={`Are you sure you want to delete ${domain.name}? This action cannot be undone.`}
      />
    </>
  );
} 