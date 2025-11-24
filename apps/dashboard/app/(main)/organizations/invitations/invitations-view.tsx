"use client";

import {
	CheckIcon,
	ClockIcon,
	EnvelopeIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationInvitations } from "@/hooks/use-organization-invitations";
import type {
	ActiveOrganization,
	Organization,
} from "@/hooks/use-organizations";
import { ListSkeleton } from "../components/list-skeleton";
import { InvitationList } from "./invitation-list";

function InvitationsSkeleton() {
	return <ListSkeleton count={6} />;
}

function EmptyInvitationsState({
	setShowInviteMemberDialog,
}: {
	setShowInviteMemberDialog: () => void;
}) {
	return (
		<EmptyState
			action={{
				label: "Invite Member",
				onClick: setShowInviteMemberDialog,
				size: "sm",
			}}
			description="There are no pending invitations for this organization. All invited members have either joined or declined their invitations."
			icon={<EnvelopeIcon weight="duotone" />}
			title="No Pending Invitations"
			variant="minimal"
		/>
	);
}

export function InvitationsView({
	organization,
}: {
	organization: NonNullable<Organization | ActiveOrganization>;
}) {
	const {
		filteredInvitations,
		isLoading: isLoadingInvitations,
		selectedTab,
		isCancelling: isCancellingInvitation,
		pendingCount,
		expiredCount,
		acceptedCount,
		cancelInvitation,
		setTab,
	} = useOrganizationInvitations(organization.id);

	const [showInviteMemberDialog, setShowInviteMemberDialog] = useState(false);

	if (isLoadingInvitations) {
		return <InvitationsSkeleton />;
	}

	if (
		!filteredInvitations ||
		(pendingCount === 0 && expiredCount === 0 && acceptedCount === 0)
	) {
		return (
			<div className="flex h-full flex-col">
				<InviteMemberDialog
					onOpenChange={setShowInviteMemberDialog}
					open={showInviteMemberDialog}
					organizationId={organization.id}
				/>
				<EmptyInvitationsState
					setShowInviteMemberDialog={() => setShowInviteMemberDialog(true)}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 p-4 sm:p-6">
				<Tabs
					className="flex h-full flex-col"
					onValueChange={setTab}
					value={selectedTab}
				>
					<div className="mb-6 border-b sm:mb-8">
						<TabsList className="h-10 w-full justify-start rounded-none border-0 bg-transparent p-0 sm:h-12">
							<TabsTrigger
								className="h-10 rounded-none border-transparent border-b-2 bg-transparent px-3 pt-2 pb-2 font-medium text-muted-foreground text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:h-12 sm:px-6 sm:pt-3 sm:pb-3 sm:text-sm"
								value="pending"
							>
								<ClockIcon
									className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"
									size={12}
									weight="duotone"
								/>
								Pending
								{pendingCount > 0 && (
									<span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs sm:ml-2 sm:px-2">
										{pendingCount}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger
								className="h-10 rounded-none border-transparent border-b-2 bg-transparent px-3 pt-2 pb-2 font-medium text-muted-foreground text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:h-12 sm:px-6 sm:pt-3 sm:pb-3 sm:text-sm"
								value="expired"
							>
								<XIcon
									className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"
									size={12}
									weight="bold"
								/>
								Expired
								{expiredCount > 0 && (
									<span className="ml-1 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 font-medium text-muted-foreground text-xs sm:ml-2 sm:px-2">
										{expiredCount}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger
								className="h-10 rounded-none border-transparent border-b-2 bg-transparent px-3 pt-2 pb-2 font-medium text-muted-foreground text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:h-12 sm:px-6 sm:pt-3 sm:pb-3 sm:text-sm"
								value="accepted"
							>
								<CheckIcon
									className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"
									size={12}
									weight="bold"
								/>
								Accepted
								{acceptedCount > 0 && (
									<span className="ml-1 rounded-full bg-green-500/10 px-1.5 py-0.5 font-medium text-green-600 text-xs sm:ml-2 sm:px-2">
										{acceptedCount}
									</span>
								)}
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent className="flex-1" value="pending">
						{pendingCount > 0 ? (
							<InvitationList
								invitations={filteredInvitations}
								isCancellingInvitation={isCancellingInvitation}
								onCancelInvitationAction={cancelInvitation}
							/>
						) : (
							<EmptyState
								description="All sent invitations have been responded to or have expired."
								icon={
									<EnvelopeIcon
										className="size-6 text-accent-foreground"
										weight="duotone"
									/>
								}
								title="No Pending Invitations"
							/>
						)}
					</TabsContent>

					<TabsContent className="flex-1" value="expired">
						{expiredCount > 0 ? (
							<InvitationList
								invitations={filteredInvitations}
								isCancellingInvitation={isCancellingInvitation}
								onCancelInvitationAction={cancelInvitation}
							/>
						) : (
							<EmptyState
								description="Great! You don't have any expired invitations at the moment."
								icon={
									<ClockIcon
										className="size-6 text-accent-foreground"
										weight="duotone"
									/>
								}
								title="No Expired Invitations"
								variant="minimal"
							/>
						)}
					</TabsContent>

					<TabsContent className="flex-1" value="accepted">
						{acceptedCount > 0 ? (
							<InvitationList
								invitations={filteredInvitations}
								isCancellingInvitation={isCancellingInvitation}
								onCancelInvitationAction={cancelInvitation}
							/>
						) : (
							<EmptyState
								description="When team members accept invitations, they'll appear here."
								icon={
									<CheckIcon
										className="size-6 text-accent-foreground"
										weight="duotone"
									/>
								}
								title="No Accepted Invitations Yet"
								variant="minimal"
							/>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
