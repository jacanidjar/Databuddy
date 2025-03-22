import Background from "@/app/components/background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import Pricing from "@/app/components/pricing";
import FadeIn from "@/app/components/FadeIn";
import { Metadata } from "next";
import { DollarSign, CheckCircle, Shield, Zap, CreditCard, Wallet, Users } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Pricing Plans | Databuddy Analytics Privacy-First Web Analytics",
  description: "Explore Databuddy Analytics pricing plans starting with 50,000 free pageviews monthly. GDPR-compliant, cookie-free analytics with flexible options for businesses of all sizes.",
  keywords: ["analytics pricing", "web analytics cost", "GDPR compliant analytics", "cookieless analytics pricing", "privacy-first analytics plans", "free website analytics"],
  alternates: {
    canonical: "https://www.databuddy.cc/pricing"
  },
  openGraph: {
    title: "Transparent Pricing Plans for Privacy-First Analytics | Databuddy",
    description: "Explore Databuddy Analytics pricing plans starting with 50,000 free pageviews monthly. GDPR-compliant, cookie-free analytics with flexible options for businesses of all sizes.",
    url: "https://www.databuddy.cc/pricing",
    type: "website",
    siteName: "Databuddy Analytics"
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy-First Analytics Pricing | Databuddy",
    description: "Explore Databuddy Analytics pricing plans starting with 50,000 free pageviews monthly. GDPR-compliant, cookie-free analytics with flexible options for businesses of all sizes."
  }
};

export default function PricingPage() {
  // Pricing data for structured markup
  const pricingData = {
    "@context": "https://schema.org/",
    "@type": "PriceSpecification",
    "priceCurrency": "USD",
    "price": "0",
    "minPrice": "0",
    "maxPrice": "299",
    "description": "Databuddy Analytics pricing ranges from free (50,000 pageviews/month) to $299/month for Enterprise plans.",
    "validFrom": "2023-01-01",
    "eligibleTransactionVolume": {
      "@type": "PriceSpecification",
      "price": "0",
      "priceCurrency": "USD",
      "eligibleQuantity": {
        "@type": "QuantitativeValue",
        "value": "50000",
        "unitText": "pageview"
      }
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "50,000 pageviews/month, basic analytics features, 30 days data retention"
      },
      {
        "@type": "Offer",
        "name": "Growth Plan",
        "price": "29",
        "priceCurrency": "USD",
        "description": "500,000 pageviews/month, all features, unlimited data retention, priority support"
      },
      {
        "@type": "Offer",
        "name": "Business Plan",
        "price": "99",
        "priceCurrency": "USD",
        "description": "2,000,000 pageviews/month, all features, unlimited data retention, premium support"
      },
      {
        "@type": "Offer",
        "name": "Enterprise Plan",
        "price": "299",
        "priceCurrency": "USD",
        "description": "10,000,000+ pageviews/month, custom features, dedicated support, SLA"
      }
    ]
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Script 
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingData) }}
      />
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        <main className="pt-8" itemScope itemType="https://schema.org/PriceSpecification">
          {/* Hero section with glow effect */}
          <FadeIn>
            <section className="container mx-auto px-4 py-16 max-w-6xl relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              
              <div className="text-center mb-8 relative">
                <div className="inline-flex items-center justify-center p-2 bg-sky-500/10 rounded-full mb-5 border border-sky-500/20">
                  <DollarSign className="h-6 w-6 text-sky-400" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-6">
                  Simple, Transparent Pricing
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                  Start with <span itemProp="minPrice">50,000 free pageviews</span> per month. Scale up as you grow with our flexible pricing options designed for businesses of all sizes.
                </p>
                
                {/* Key benefits */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-3xl mx-auto mt-10">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="text-slate-200">No credit card required to start</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="text-slate-200">GDPR and CCPA compliant</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="text-slate-200">14-day money back guarantee</span>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>

          {/* Main pricing section */}
          <FadeIn>
            <section aria-labelledby="pricing-plans" className="container mx-auto px-4 mb-16">
              <h2 id="pricing-plans" className="sr-only">Databuddy Analytics Pricing Plans</h2>
              <div className="bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-xl shadow-sky-500/5 overflow-hidden">
                <Pricing />
              </div>
            </section>
          </FadeIn>

          {/* Key features included across all plans */}
          <FadeIn delay={50}>
            <section aria-labelledby="included-features" className="container mx-auto px-4 py-8 max-w-5xl">
              <h2 id="included-features" className="text-2xl font-bold text-center text-white mb-10">Features Included With All Plans</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/50 transition-all">
                  <div className="bg-sky-500/10 p-3 rounded-xl w-fit mb-4">
                    <Shield className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Privacy-First Analytics</h3>
                  <p className="text-slate-300">
                    Cookieless tracking, GDPR and CCPA compliant out of the box, no consent banners needed.
                  </p>
                </div>
                
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/50 transition-all">
                  <div className="bg-sky-500/10 p-3 rounded-xl w-fit mb-4">
                    <Zap className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Ultra-Fast Performance</h3>
                  <p className="text-slate-300">
                    Lightweight tracking script (just 1.5KB), 247x smaller than Google Analytics with minimal site impact.
                  </p>
                </div>
                
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/50 transition-all">
                  <div className="bg-sky-500/10 p-3 rounded-xl w-fit mb-4">
                    <Wallet className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Full Data Ownership</h3>
                  <p className="text-slate-300">
                    You own 100% of your analytics data with complete control and export capabilities.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          {/* FAQ section */}
          <FadeIn delay={100}>
            <section aria-labelledby="pricing-faq" className="container mx-auto px-4 py-16 max-w-4xl">
              <h2 id="pricing-faq" className="text-3xl font-bold text-center text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-400 text-center mb-10">Everything you need to know about our pricing and billing</p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Can I upgrade or downgrade my plan?</h3>
                  <p className="text-slate-300">
                    Yes, you can change your plan at any time. Changes take effect on your next billing cycle, and you&apos;ll only be charged for what you use.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Do you offer refunds?</h3>
                  <p className="text-slate-300">
                    We offer a 14-day money-back guarantee if you&apos;re not satisfied with our service. No questions asked.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">What happens if I exceed my pageviews?</h3>
                  <p className="text-slate-300">
                    With the pay-as-you-go plan, you&apos;ll be billed for additional pageviews at a tiered rate. With bundles, you can purchase additional capacity as needed.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Do you offer custom plans?</h3>
                  <p className="text-slate-300">
                    Yes, we offer custom plans for businesses with specific needs. Contact our sales team for more information.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">How does the free plan work?</h3>
                  <p className="text-slate-300">
                    Our free plan includes 50,000 pageviews per month with core features. No credit card required, and you can upgrade anytime.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">How are pageviews counted?</h3>
                  <p className="text-slate-300">
                    A pageview is counted each time a page loads with our tracking script. We don&apos;t count bot traffic or repetitive views from the same user within a short timeframe.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <p className="text-slate-400">
                  Have more questions about our pricing? <Link href="/faq" className="text-sky-400 hover:text-sky-300">Visit our complete FAQ</Link> or <Link href="/contact" className="text-sky-400 hover:text-sky-300">contact our team</Link>.
                </p>
              </div>
            </section>
          </FadeIn>
          
          {/* Enterprise CTA */}
          <FadeIn delay={150}>
            <section aria-labelledby="enterprise-solutions" className="container mx-auto px-4 py-16 max-w-5xl">
              <div className="bg-gradient-to-r from-sky-900/20 to-blue-900/20 rounded-2xl p-8 md:p-12 border border-sky-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -z-10" />
                <div className="md:flex items-center justify-between">
                  <div className="mb-6 md:mb-0 md:mr-8">
                    <h2 id="enterprise-solutions" className="text-2xl md:text-3xl font-bold text-white mb-4">Need a custom enterprise solution?</h2>
                    <p className="text-slate-300 md:text-lg max-w-xl">
                      Our enterprise plan offers dedicated support, custom features, flexible pricing, and tailored solutions for large organizations with unique requirements.
                    </p>
                    <div className="flex items-center mt-6">
                      <Users className="h-5 w-5 text-sky-400 mr-2" />
                      <span className="text-slate-300">Supporting organizations of all sizes, from startups to Fortune 500</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Link
                      href="/contact" 
                      className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
                    >
                      Contact Sales
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>
        </main>
        <Footer />
      </div>
    </div>
  );
} 