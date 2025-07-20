"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { type Invoice, type Customer } from "../data/billing-data";
import { useBilling } from "@/app/(main)/billing/hooks/use-billing";
import { CheckIcon, ClockIcon, XIcon, FileTextIcon, CreditCardIcon, CalendarIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";

function InvoiceCard({ invoice }: { invoice: Invoice }) {
    const getStatusBadge = () => {
        switch (invoice.status) {
            case 'paid':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">Paid</Badge>;
            case 'open':
            case 'pending':
                return <Badge variant="secondary" className="text-xs">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive" className="text-xs">Failed</Badge>;
            case 'draft':
                return <Badge variant="outline" className="text-xs">Draft</Badge>;
            case 'void':
                return <Badge variant="outline" className="text-xs">Void</Badge>;
            default:
                return null;
        }
    };

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const getProductNames = (productIds: string[]) => {
        const productMap: Record<string, string> = {
            'free': 'Free',
            'pro': 'Pro',
            'buddy': 'Buddy',
        };
        return productIds.map(id => productMap[id] || id).join(', ');
    };

    return (
        <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded border flex items-center justify-center flex-shrink-0">
                            <FileTextIcon size={16} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">#{invoice.stripe_id.slice(-8)}</h4>
                                {getStatusBadge()}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{dayjs(invoice.created_at).format('MMM D, YYYY')}</span>
                                <span>{getProductNames(invoice.product_ids)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                            <div className="font-semibold">
                                {formatAmount(invoice.total, invoice.currency)}
                            </div>
                        </div>

                        {invoice.hosted_invoice_url && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer h-8 px-2"
                                onClick={() => {
                                    if (invoice.hosted_invoice_url) {
                                        window.open(invoice.hosted_invoice_url, '_blank');
                                    }
                                }}
                            >
                                <ArrowSquareOutIcon size={14} />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SubscriptionHistoryCard({ customerData }: { customerData: any }) {
    if (!customerData?.products?.length) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarIcon size={16} />
                    Subscription History
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {customerData.products.map((product: any) => (
                        <div key={product.id} className="flex items-start gap-2 p-2 border rounded text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <CheckIcon size={10} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm truncate">{product.name || product.id}</h4>
                                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="text-xs ml-2">
                                        {product.status}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <div>Started: {dayjs(product.started_at).format('MMM D, YYYY')}</div>
                                    {product.current_period_end && (
                                        <div className="mt-0.5">
                                            {product.canceled_at ? 'Ends' : 'Renews'}: {dayjs(product.current_period_end).format('MMM D, YYYY')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface HistoryTabProps {
    invoices: Invoice[];
    customerData: Customer | null;
    isLoading: boolean;
}

export function HistoryTab({ invoices, customerData, isLoading }: HistoryTabProps) {
    const { onManageBilling } = useBilling();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Billing History</h2>
                    <p className="text-muted-foreground text-sm">
                        View your invoices, payments, and subscription changes
                    </p>
                </div>

                <Button onClick={onManageBilling} variant="outline" size="sm" className="cursor-pointer">
                    <CreditCardIcon size={14} className="mr-2" />
                    Manage Billing
                    <ArrowSquareOutIcon size={12} className="ml-1" />
                </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Recent Invoices</h3>

                        {!invoices.length ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="w-12 h-12 rounded border flex items-center justify-center mb-4">
                                        <FileTextIcon size={24} className="text-muted-foreground" />
                                    </div>
                                    <h4 className="text-lg font-semibold mb-2">No Invoices Yet</h4>
                                    <p className="text-muted-foreground text-center text-sm max-w-sm">
                                        Your invoices will appear here once you start using paid features.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {invoices
                                    .sort((a: Invoice, b: Invoice) => b.created_at - a.created_at)
                                    .map((invoice: Invoice) => (
                                        <InvoiceCard key={invoice.stripe_id} invoice={invoice} />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <SubscriptionHistoryCard customerData={customerData} />
                </div>
            </div>
        </div>
    );
} 