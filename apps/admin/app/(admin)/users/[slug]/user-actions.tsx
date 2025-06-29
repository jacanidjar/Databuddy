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
import { toast } from "sonner";
import {
  ChevronDown,
  Edit,
  Mail,
  MoreHorizontal,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { updateUserStatus, updateUserRole } from "../actions";

interface UserActionsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    firstName: string | null;
    lastName: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    role: 'ADMIN' | 'USER' | 'EARLY_ADOPTER' | 'INVESTOR' | 'BETA_TESTER' | 'GUEST';
    twoFactorEnabled: boolean | null;

    websites: Array<{
      id: string;
      name: string | null;
      domain: string;
      status: 'ACTIVE' | 'HEALTHY' | 'UNHEALTHY' | 'INACTIVE' | 'PENDING';
      createdAt: string;
    }>;
    projects: Array<{
      id: string;
      name: string;
      slug: string;
      type: 'WEBSITE' | 'MOBILE_APP' | 'DESKTOP_APP' | 'API';
      status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
      createdAt: string;
    }>;
  };
}

export function UserActions({ user }: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-2">
        <Mail className="h-4 w-4" />
        Contact
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserCog className="mr-2 h-4 w-4" />
            Manage Access
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.status === 'SUSPENDED' ? (
            <DropdownMenuItem
              className="text-green-600"
              onClick={async () => {
                const result = await updateUserStatus(user.id, 'ACTIVE');
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success('User account reactivated successfully');
                }
              }}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Reactivate Account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                const result = await updateUserStatus(user.id, 'SUSPENDED');
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success('User suspended successfully');
                }
              }}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Suspend Account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RoleActions({ user }: UserActionsProps) {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'USER': return 'User';
      case 'EARLY_ADOPTER': return 'Early Adopter';
      case 'INVESTOR': return 'Investor';
      case 'BETA_TESTER': return 'Beta Tester';
      case 'GUEST': return 'Guest';
      default: return role;
    }
  };

  const roles: Array<{ value: 'ADMIN' | 'USER' | 'EARLY_ADOPTER' | 'INVESTOR' | 'BETA_TESTER' | 'GUEST', label: string }> = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'USER', label: 'User' },
    { value: 'EARLY_ADOPTER', label: 'Early Adopter' },
    { value: 'INVESTOR', label: 'Investor' },
    { value: 'BETA_TESTER', label: 'Beta Tester' },
    { value: 'GUEST', label: 'Guest' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {getRoleDisplayName(user.role)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={async () => {
              const result = await updateUserRole(user.id, role.value);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success(`Role updated to ${role.label}`);
              }
            }}
            className={user.role === role.value ? 'bg-accent' : ''}
          >
            {role.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 