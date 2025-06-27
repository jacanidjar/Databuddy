"use client";

import { CheckCircle, CreditCard, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { type ProductKey, TEST_PRODUCTS } from "@/lib/stripe";

// Simple client ID configuration (same as layout.tsx)
const CLIENT_ID =
  process.env.NODE_ENV === "development"
    ? "5ced32e5-0219-4e75-a18a-ad9826f85698"
    : "3ed1fce1-5a56-4cb6-a977-66864f6d18e3";

export default function TestPaymentPage() {
  const [loading, setLoading] = useState<ProductKey | null>(null);

  const handlePayment = async (productKey: ProductKey) => {
    setLoading(productKey);

    try {
      // Get session ID from Databuddy (or generate fallback)
      const sessionId = sessionStorage.getItem("did_session") || `test_${Date.now()}`;

      console.log("Creating payment with:", { productKey, clientId: CLIENT_ID, sessionId });

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productKey,
          clientId: CLIENT_ID,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">Test Stripe Integration</h1>
          <p className="mb-6 text-gray-600 text-xl">
            Test our Stripe payment integration with these demo products
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 font-medium text-sm text-yellow-800">
            <Shield className="h-4 w-4" />
            Test Mode - No real charges will be made
          </div>
        </div>

        {/* Payment Cards */}
        <div className="mb-12 grid gap-8 md:grid-cols-2">
          {Object.entries(TEST_PRODUCTS).map(([key, product]) => {
            const productKey = key as ProductKey;
            const isLoading = loading === productKey;

            return (
              <div
                className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"
                key={key}
              >
                <div className="mb-6 text-center">
                  <h3 className="mb-2 font-bold text-2xl text-gray-900">{product.name}</h3>
                  <p className="mb-4 text-gray-600">{product.description}</p>
                  <div className="font-bold text-3xl text-blue-600">
                    ${(product.price / 100).toFixed(2)}
                    <span className="font-normal text-gray-500 text-lg">
                      /{product.currency.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Analytics tracking included</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Webhook integration</span>
                  </div>
                </div>

                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => handlePayment(productKey)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay with Stripe
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Test Card Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <h3 className="mb-4 font-bold text-gray-900 text-xl">Test Card Information</h3>
          <p className="mb-4 text-gray-600">
            Use these test card numbers to simulate different payment scenarios:
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">Successful Payment</h4>
                <p className="font-mono text-gray-700 text-sm">4242 4242 4242 4242</p>
                <p className="text-gray-600 text-sm">Any future date, any CVC</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">Declined Payment</h4>
                <p className="font-mono text-gray-700 text-sm">4000 0000 0000 0002</p>
                <p className="text-gray-600 text-sm">Any future date, any CVC</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">Requires Authentication</h4>
                <p className="font-mono text-gray-700 text-sm">4000 0025 0000 3155</p>
                <p className="text-gray-600 text-sm">Any future date, any CVC</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">Insufficient Funds</h4>
                <p className="font-mono text-gray-700 text-sm">4000 0000 0000 9995</p>
                <p className="text-gray-600 text-sm">Any future date, any CVC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            onClick={() => (window.location.href = "/")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
