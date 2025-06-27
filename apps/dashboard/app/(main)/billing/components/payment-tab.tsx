"use client";

import { CreditCard, Edit3, Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface PaymentMethod {
  id: string;
  type: "card";
  last4: string;
  brand: string;
  expiry: string;
  default: boolean;
  name: string;
  country: string;
}

interface PaymentTabProps {
  paymentMethods: PaymentMethod[];
  onAddPayment: () => void;
  onDeletePayment: (methodId: string) => void;
  loadingStates: Record<string, boolean>;
}

export function PaymentTab({
  paymentMethods,
  onAddPayment,
  onDeletePayment,
  loadingStates,
}: PaymentTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Manage your payment methods and billing information
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                key={method.id}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-1.5">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {method.brand} •••• {method.last4}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Expires {method.expiry} • {method.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.default && (
                    <Badge className="text-xs" variant="secondary">
                      Default
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit3 className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  {!method.default && (
                    <Button
                      disabled={loadingStates[`delete-${method.id}`]}
                      onClick={() => onDeletePayment(method.id)}
                      size="sm"
                      variant="ghost"
                    >
                      {loadingStates[`delete-${method.id}`] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <Button
              className="w-full"
              disabled={loadingStates["add-payment"]}
              onClick={onAddPayment}
              size="sm"
              variant="outline"
            >
              {loadingStates["add-payment"] ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Payment Method
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Billing Settings</CardTitle>
          <p className="text-muted-foreground text-sm">Configure your billing preferences</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-sm" htmlFor="auto-pay">
                Automatic payments
              </Label>
              <p className="text-muted-foreground text-xs">
                Automatically charge your default payment method
              </p>
            </div>
            <Switch defaultChecked id="auto-pay" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-sm" htmlFor="email-receipts">
                Email receipts
              </Label>
              <p className="text-muted-foreground text-xs">Send payment receipts to your email</p>
            </div>
            <Switch defaultChecked id="email-receipts" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-sm" htmlFor="usage-alerts">
                Usage alerts
              </Label>
              <p className="text-muted-foreground text-xs">
                Get notified when approaching plan limits
              </p>
            </div>
            <Switch defaultChecked id="usage-alerts" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
