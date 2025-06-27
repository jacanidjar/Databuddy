"use client";

import { ArrowRight, CheckCircle2, Crown, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number | null;
  originalPrice?: number;
  description: string;
  features: string[];
  limits: {
    websites: number | null;
    pageviews: number | null;
    dataRetention: string;
    teamMembers: number | null;
  };
  current: boolean;
  popular: boolean;
  recommended?: boolean;
  badge?: string;
}

interface PlansTabProps {
  plans: SubscriptionPlan[];
  onUpgrade: (plan: SubscriptionPlan) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

export function PlansTab({ plans, onUpgrade, formatCurrency, isLoading }: PlansTabProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-bold text-xl">Choose Your Plan</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Upgrade or downgrade anytime. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            className={`relative transition-all hover:shadow-md ${
              plan.current ? "ring-2 ring-primary" : ""
            } ${plan.popular ? "scale-[1.02] ring-2 ring-purple-500" : ""}`}
            key={plan.id}
          >
            {plan.popular && (
              <div className="-top-3 -translate-x-1/2 absolute left-1/2">
                <Badge className="bg-purple-500 px-3 py-1 text-white">
                  <Star className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            {plan.recommended && (
              <div className="-top-3 absolute right-3">
                <Badge variant="secondary">Recommended</Badge>
              </div>
            )}
            {plan.badge && (
              <div className="-top-3 absolute left-3">
                <Badge className="bg-orange-100 text-orange-700" variant="outline">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3 text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {plan.name}
                {plan.current && <Badge variant="secondary">Current</Badge>}
              </CardTitle>
              <p className="text-muted-foreground text-sm">{plan.description}</p>
              <div className="mt-3">
                {plan.price === null ? (
                  <div>
                    <span className="font-bold text-2xl">Custom</span>
                    <p className="mt-1 text-muted-foreground text-xs">Contact sales</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-2xl">{formatCurrency(plan.price)}</span>
                      {plan.originalPrice && (
                        <span className="text-muted-foreground text-sm line-through">
                          {formatCurrency(plan.originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">per month</p>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Limits</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Websites</span>
                    <p className="font-medium">{plan.limits.websites || "Unlimited"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pageviews</span>
                    <p className="font-medium">
                      {plan.limits.pageviews ? plan.limits.pageviews.toLocaleString() : "Unlimited"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retention</span>
                    <p className="font-medium">{plan.limits.dataRetention}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Team</span>
                    <p className="font-medium">{plan.limits.teamMembers || "Unlimited"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <h4 className="font-medium text-sm">Features</h4>
                <ul className="space-y-0.5">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li className="flex items-center text-xs" key={feature}>
                      <CheckCircle2 className="mr-2 h-3 w-3 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="ml-5 text-muted-foreground text-xs">
                      +{plan.features.length - 5} more
                    </li>
                  )}
                </ul>
              </div>

              <Button
                className="mt-4 w-full"
                disabled={plan.current || isLoading}
                onClick={() => onUpgrade(plan)}
                size="sm"
                variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
              >
                {plan.current ? (
                  "Current Plan"
                ) : plan.price === null ? (
                  <>
                    Contact Sales
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Upgrade to {plan.name}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
