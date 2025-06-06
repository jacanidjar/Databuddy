'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { transferWebsite, searchUsers } from "../actions";
import { cn } from "@/lib/utils";

interface Website {
  id: string;
  name: string | null;
  domain: string;
  status: 'ACTIVE' | 'HEALTHY' | 'UNHEALTHY' | 'INACTIVE' | 'PENDING';
  createdAt: string;
}

interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface TransferWebsiteFormProps {
  website: Website;
}

export function TransferWebsiteForm({ website }: TransferWebsiteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await searchUsers(''); // Empty query returns all users
      if (result.error) {
        toast.error(result.error);
        setUsers([]);
      } else {
        setUsers(result.users || []);
      }
    } catch (error) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to transfer to');
      return;
    }

    setIsLoading(true);
    try {
      const result = await transferWebsite(website.id, selectedUser.id);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message || 'Website transferred successfully');
      setIsOpen(false);
      setSelectedUser(null);
      setUsers([]);
    } catch (error) {
      toast.error('Failed to transfer website');
      console.error('Error transferring website:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setUsers([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
      } else {
        loadUsers();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Transfer Website
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Website</DialogTitle>
          <DialogDescription>
            Transfer "{website.name || website.domain}" to another user. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select User</Label>
            
            {isLoadingUsers && (
              <div className="text-sm text-muted-foreground">Loading users...</div>
            )}
            
            {users.length > 0 && (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={cn(
                      "p-3 rounded-md border hover:bg-muted cursor-pointer text-left transition-colors",
                      selectedUser?.id === user.id && "bg-muted border-primary"
                    )}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name || user.email}</span>
                        {user.name && (
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{user.role}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {!isLoadingUsers && users.length === 0 && (
              <div className="text-sm text-muted-foreground">No users available</div>
            )}
          </div>

          {selectedUser && (
            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground mb-2">Transfer Details:</div>
              <div className="space-y-1 text-sm">
                <div><strong>Website:</strong> {website.name || website.domain}</div>
                <div><strong>Domain:</strong> {website.domain}</div>
                <div><strong>To User:</strong> {selectedUser.name || selectedUser.email}</div>
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Role:</strong> {selectedUser.role}</div>
              </div>
              <div className="mt-2 text-xs text-amber-600">
                ⚠️ This action will transfer ownership and cannot be undone.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer} 
            disabled={isLoading || !selectedUser}
            variant="destructive"
          >
            {isLoading ? 'Transferring...' : 'Transfer Website'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 