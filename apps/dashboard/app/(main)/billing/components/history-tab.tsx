"use client";

import { CheckCircle2, Download, History, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "failed";
  description: string;
  period: string;
  pdfUrl: string;
  paymentMethod: string;
}

interface HistoryTabProps {
  billingHistory: BillingHistoryItem[];
  onDownload: (invoiceId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  loadingStates: Record<string, boolean>;
}

export function HistoryTab({
  billingHistory,
  onDownload,
  formatCurrency,
  formatDate,
  loadingStates,
}: HistoryTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-4 w-4" />
          Billing History
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          View and download your invoices and payment history
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {billingHistory.map((invoice) => (
            <div
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              key={invoice.id}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-1.5 ${
                    invoice.status === "paid" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {invoice.status === "paid" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{invoice.description}</div>
                  <div className="text-muted-foreground text-xs">
                    {invoice.id} • {formatDate(invoice.date)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {invoice.period} • {invoice.paymentMethod}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium text-sm">{formatCurrency(invoice.amount)}</div>
                  <Badge
                    className="text-xs"
                    variant={invoice.status === "paid" ? "secondary" : "destructive"}
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <Button
                  className="h-8 w-8"
                  disabled={loadingStates[`download-${invoice.id}`]}
                  onClick={() => onDownload(invoice.id)}
                  size="icon"
                  variant="ghost"
                >
                  {loadingStates[`download-${invoice.id}`] ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
