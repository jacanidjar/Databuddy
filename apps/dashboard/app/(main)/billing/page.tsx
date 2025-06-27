"use client";

import { Activity, CreditCard, Crown, History, RefreshCw, Settings } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BillingAlerts } from "./components/billing-alerts";
import {
  type BillingAlert,
  billingHistory,
  paymentMethods,
  type SubscriptionPlan,
  subscriptionPlans,
  usageData,
} from "./data/billing-data";

// Dynamic imports for tabs
const OverviewTab = lazy(() =>
  import("./components/overview-tab").then((m) => ({ default: m.OverviewTab }))
);
const PlansTab = lazy(() =>
  import("./components/plans-tab").then((m) => ({ default: m.PlansTab }))
);
const HistoryTab = lazy(() =>
  import("./components/history-tab").then((m) => ({ default: m.HistoryTab }))
);
const PaymentTab = lazy(() =>
  import("./components/payment-tab").then((m) => ({ default: m.PaymentTab }))
);
const BillingDialogs = lazy(() =>
  import("./components/billing-dialogs").then((m) => ({ default: m.BillingDialogs }))
);

function TabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [billingAlerts, setBillingAlerts] = useState<BillingAlert[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const currentPlan = subscriptionPlans.find((p) => p.current)?.name || "Starter";

  useEffect(() => {
    const alerts: BillingAlert[] = [];

    if (
      usageData.pageviews.limit &&
      usageData.pageviews.current / usageData.pageviews.limit > 0.8
    ) {
      alerts.push({
        id: "pageviews-warning",
        type: "warning",
        title: "Approaching pageview limit",
        message: `You've used ${Math.round((usageData.pageviews.current / usageData.pageviews.limit) * 100)}% of your monthly pageviews.`,
        action: { label: "Upgrade Plan", onClick: () => setActiveTab("plans") },
      });
    }

    const failedPayment = billingHistory.find((invoice) => invoice.status === "failed");
    if (failedPayment) {
      alerts.push({
        id: "payment-failed",
        type: "error",
        title: "Payment failed",
        message: `Your payment for ${failedPayment.description} failed. Please update your payment method.`,
        action: { label: "Update Payment", onClick: () => setActiveTab("payment") },
      });
    }

    setBillingAlerts(alerts);
  }, []);

  const setLoadingState = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;

    setLoadingState("upgrade", true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Successfully upgraded to ${selectedPlan.name} plan!`);
      setShowUpgradeDialog(false);
      setSelectedPlan(null);
    } catch (error) {
      toast.error("Failed to upgrade plan. Please try again.");
    } finally {
      setLoadingState("upgrade", false);
    }
  };

  const handleAddPaymentMethod = async () => {
    setLoadingState("add-payment", true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Payment method added successfully");
    } catch (error) {
      toast.error("Failed to add payment method");
    } finally {
      setLoadingState("add-payment", false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    setLoadingState(`download-${invoiceId}`, true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setLoadingState(`download-${invoiceId}`, false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setLoadingState(`delete-${methodId}`, true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Payment method removed");
    } catch (error) {
      toast.error("Failed to remove payment method");
    } finally {
      setLoadingState(`delete-${methodId}`, false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Billing & Subscription</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage your subscription, usage, and billing preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="px-2 py-1" variant="outline">
            <Crown className="mr-1 h-3 w-3" />
            {currentPlan} Plan
          </Badge>
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-1 h-3 w-3" />
            Sync
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <BillingAlerts alerts={billingAlerts} />

      {/* Tabs */}
      <Tabs className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <div className="relative border-b">
          <TabsList className="h-10 w-full justify-start overflow-x-auto bg-transparent p-0">
            <TabsTrigger
              className="relative h-10 cursor-pointer touch-manipulation whitespace-nowrap rounded-none px-2 text-xs transition-colors hover:bg-muted/50 sm:px-4 sm:text-sm"
              value="overview"
            >
              <Activity className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-10 cursor-pointer touch-manipulation whitespace-nowrap rounded-none px-2 text-xs transition-colors hover:bg-muted/50 sm:px-4 sm:text-sm"
              value="plans"
            >
              <CreditCard className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Plans</span>
              {activeTab === "plans" && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-10 cursor-pointer touch-manipulation whitespace-nowrap rounded-none px-2 text-xs transition-colors hover:bg-muted/50 sm:px-4 sm:text-sm"
              value="history"
            >
              <History className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">History</span>
              {activeTab === "history" && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-10 cursor-pointer touch-manipulation whitespace-nowrap rounded-none px-2 text-xs transition-colors hover:bg-muted/50 sm:px-4 sm:text-sm"
              value="payment"
            >
              <Settings className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Payment</span>
              {activeTab === "payment" && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="animate-fadeIn transition-all duration-200" value="overview">
          <Suspense fallback={<TabSkeleton />}>
            <OverviewTab
              currentPlan={currentPlan}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onCancel={() => setShowCancelDialog(true)}
              onUpgrade={() => setActiveTab("plans")}
              usageData={usageData}
            />
          </Suspense>
        </TabsContent>

        <TabsContent className="animate-fadeIn transition-all duration-200" value="plans">
          <Suspense fallback={<TabSkeleton />}>
            <PlansTab
              formatCurrency={formatCurrency}
              isLoading={loadingStates.upgrade}
              onUpgrade={handleUpgrade}
              plans={subscriptionPlans}
            />
          </Suspense>
        </TabsContent>

        <TabsContent className="animate-fadeIn transition-all duration-200" value="history">
          <Suspense fallback={<TabSkeleton />}>
            <HistoryTab
              billingHistory={billingHistory}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              loadingStates={loadingStates}
              onDownload={handleDownloadInvoice}
            />
          </Suspense>
        </TabsContent>

        <TabsContent className="animate-fadeIn transition-all duration-200" value="payment">
          <Suspense fallback={<TabSkeleton />}>
            <PaymentTab
              loadingStates={loadingStates}
              onAddPayment={handleAddPaymentMethod}
              onDeletePayment={handleDeletePaymentMethod}
              paymentMethods={paymentMethods}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Suspense fallback={null}>
        <BillingDialogs
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          isLoading={loadingStates.upgrade}
          nextBillingDate={usageData.nextBillingDate}
          onCancelClose={() => setShowCancelDialog(false)}
          onConfirmCancel={() => {
            toast.success(
              "Subscription cancelled. You'll retain access until your next billing date."
            );
            setShowCancelDialog(false);
          }}
          onConfirmUpgrade={confirmUpgrade}
          onUpgradeClose={() => setShowUpgradeDialog(false)}
          selectedPlan={selectedPlan}
          showCancelDialog={showCancelDialog}
          showUpgradeDialog={showUpgradeDialog}
        />
      </Suspense>
    </div>
  );
}
