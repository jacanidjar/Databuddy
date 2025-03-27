import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { WebsitesList } from "@/components/websites-list";
import { AddWebsiteDialog } from "@/components/add-website-dialog";
import { getUserWebsites } from "@/app/actions/websites";
import type { Website } from "@/types/website";

export const metadata: Metadata = {
  title: "Websites | Databuddy",
  description: "Manage your websites and analytics",
};

export default async function WebsitesPage() {
  const response = await getUserWebsites();
  const websites = response.error ? [] : (response.data as Website[]);

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader 
        title="Your Websites" 
        description="Manage and monitor your website analytics" 
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Your Websites</h2>
          <p className="text-gray-500">
            You have {websites.length} website{websites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddWebsiteDialog />
      </div>

      <WebsitesList websites={websites} variant="list" />
    </div>
  );
} 