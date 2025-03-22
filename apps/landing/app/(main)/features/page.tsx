import Background from "@/app/components/background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FeaturesComponent from "@/app/components/features";
import FadeIn from "@/app/components/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { 
  BarChart2, 
  Code, 
  Shield, 
  Gauge, 
  Sparkles, 
  Boxes,
  Server,
  Database,
  GitBranch,
  Activity,
  ArrowRight,
  CheckCircle
} from "lucide-react";

// Define metadata for SEO
export const metadata: Metadata = {
  title: "Features | Databuddy Analytics",
  description: "Explore the complete feature set of Databuddy Analytics. Privacy-first web analytics with powerful features, simple integration, and zero impact on site performance.",
  keywords: "web analytics, privacy analytics, GDPR analytics, cookieless tracking, performance analytics, data visualization",
  alternates: {
    canonical: 'https://databuddy.cc/features',
  },
  openGraph: {
    type: 'website',
    url: 'https://databuddy.cc/features',
    title: 'Features | Databuddy Analytics',
    description: 'Privacy-first web analytics with powerful features and zero impact on your site performance.',
    siteName: 'Databuddy Analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Databuddy Analytics Features',
    description: 'Privacy-first web analytics with powerful features and zero impact on your site performance.',
    creator: '@databuddyps',
  },
};

// Define feature categories and their details for the page
const featureCategories = [
  {
    id: "core",
    title: "Core Analytics",
    description: "Essential analytics features that form the foundation of understanding your visitors and their behavior.",
    icon: <BarChart2 className="h-6 w-6" />,
    color: "from-blue-400 to-blue-600",
    highlights: [
      "Real-time visitor tracking",
      "Traffic source analysis",
      "Page performance metrics",
      "Visitor demographics",
      "Custom events tracking"
    ]
  },
  {
    id: "privacy",
    title: "Privacy Features",
    description: "Privacy-first analytics that respects your visitors while still providing valuable insights.",
    icon: <Shield className="h-6 w-6" />,
    color: "from-green-400 to-green-600",
    highlights: [
      "Cookieless tracking",
      "GDPR & CCPA compliance",
      "No personal data collection",
      "IP anonymization",
      "Data ownership"
    ]
  },
  {
    id: "integration",
    title: "Easy Integration",
    description: "Simple setup with any website or application, regardless of your tech stack.",
    icon: <Code className="h-6 w-6" />,
    color: "from-purple-400 to-purple-600",
    highlights: [
      "Next.js integration",
      "Plain JavaScript snippet",
      "React/Vue/Angular support",
      "GitHub integration",
      "Comprehensive API"
    ]
  },
  {
    id: "performance",
    title: "Performance",
    description: "Lightning-fast analytics with zero impact on your site's speed and performance.",
    icon: <Gauge className="h-6 w-6" />,
    color: "from-orange-400 to-orange-600",
    highlights: [
      "Lightweight script (<2KB)",
      "Edge processing",
      "Core Web Vitals tracking",
      "Resource monitoring",
      "Self-hosted option"
    ]
  },
  {
    id: "dataos",
    title: "Data OS Platform",
    description: "A complete data operating system for developers and data analysts.",
    icon: <Boxes className="h-6 w-6" />,
    color: "from-sky-400 to-sky-600",
    highlights: [
      "Event streaming",
      "Developer API",
      "Plugin ecosystem",
      "Edge computing",
      "Data warehouse integration"
    ]
  },
  {
    id: "advanced",
    title: "Advanced Features",
    description: "Powerful capabilities for in-depth analysis and optimization.",
    icon: <Sparkles className="h-6 w-6" />,
    color: "from-pink-400 to-pink-600",
    highlights: [
      "AI insights",
      "Custom dashboards",
      "Goal tracking",
      "Heatmaps (coming soon)",
      "A/B testing (coming soon)"
    ]
  }
];

// Static page for features
export default function FeaturesPage() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        <main className="pt-8">
          {/* Hero section */}
          <FadeIn>
            <div className="container mx-auto px-4 py-16 max-w-6xl relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              
              <div className="text-center mb-8 relative">
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-6">
                  Powerful Features, Simple Interface
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10">
                  Everything you need to understand your audience without compromising their privacy or your site&apos;s performance.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Link href="#all-features" className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      Explore All Features
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-800">
                    <Link href="/demo" className="flex items-center gap-2">
                      See Live Demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Feature categories overview */}
          <FadeIn delay={100}>
            <div className="container mx-auto px-4 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {featureCategories.map((category) => (
                  <div key={category.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      <h2 className="text-xl font-bold">{category.title}</h2>
                    </div>
                    <p className="text-slate-400 mb-4">{category.description}</p>
                    <ul className="space-y-2 mb-6">
                      {category.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-sky-400 mr-2 shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="ghost" className="w-full justify-between hover:bg-sky-500/10 hover:text-sky-400">
                      <Link href={`#${category.id}`} className="flex items-center">
                        Learn more
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* All features section */}
          <div id="all-features">
            <FeaturesComponent />
          </div>

          {/* Why choose Databuddy section */}
          <FadeIn delay={150}>
            <div className="container mx-auto px-4 py-16 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Databuddy?</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Built for modern web applications with a focus on privacy, performance, and simplicity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-sky-500/10 rounded-full">
                      <Shield className="h-8 w-8 text-sky-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Privacy-First</h3>
                  <p className="text-slate-400">
                    No cookies, no personal data collection, and full GDPR compliance while still providing valuable insights.
                  </p>
                  <Button asChild variant="link" className="mt-4 text-sky-400">
                    <Link href="/privacy-focus">Learn about our privacy approach</Link>
                  </Button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-sky-500/10 rounded-full">
                      <Gauge className="h-8 w-8 text-sky-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                  <p className="text-slate-400">
                    Lightweight script less than 2KB with edge processing for minimal impact on your site&apos;s performance.
                  </p>
                  <Button asChild variant="link" className="mt-4 text-sky-400">
                    <Link href="/performance">View performance benchmarks</Link>
                  </Button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-sky-500/10 rounded-full">
                      <Code className="h-8 w-8 text-sky-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Easy Integration</h3>
                  <p className="text-slate-400">
                    One-line setup for Next.js and lightweight script for any website. No complex configuration needed.
                  </p>
                  <Button asChild variant="link" className="mt-4 text-sky-400">
                    <Link href="https://docs.databuddy.cc/integration">View integration guides</Link>
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* FAQ section */}
          <FadeIn delay={200}>
            <div className="container mx-auto px-4 py-16 max-w-4xl">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-400">Common questions about Databuddy&apos;s features</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">How does cookieless tracking work?</h3>
                  <p className="text-slate-300">
                    Databuddy uses a combination of techniques including probabilistic matching and session-based tracking to provide accurate analytics without cookies or personal identifiers.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Do you offer a free plan?</h3>
                  <p className="text-slate-300">
                    Yes, Databuddy offers a free plan with up to 50,000 pageviews per month and core analytics features. <Link href="/pricing" className="text-sky-400 hover:underline">View pricing details</Link>.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">What makes Databuddy different from other analytics?</h3>
                  <p className="text-slate-300">
                    Databuddy combines privacy-first design, high performance, and developer-friendly features in one platform. <Link href="/compare" className="text-sky-400 hover:underline">See how we compare</Link>.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Can I export my data?</h3>
                  <p className="text-slate-300">
                    Yes, you can export your analytics data in JSON or CSV format, or use our API for direct integration with your systems.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* CTA section */}
          <FadeIn delay={250}>
            <div className="container mx-auto px-4 py-16 max-w-5xl">
              <div className="bg-gradient-to-r from-sky-900/20 to-blue-900/20 rounded-2xl p-8 md:p-12 border border-sky-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -z-10" />
                <div className="md:flex items-center justify-between">
                  <div className="mb-8 md:mb-0 md:mr-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to get started?</h2>
                    <p className="text-slate-300 md:text-lg max-w-xl">
                      Join thousands of websites using Databuddy for privacy-focused analytics. Start with our free plan — no credit card required.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
                      <Link href="/pricing">View Pricing</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-800">
                      <Link href="/demo">Try Demo</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          
          {/* Structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Databuddy Analytics",
                "applicationCategory": "WebApplication",
                "applicationSubCategory": "Analytics",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "description": "Free tier with 50,000 pageviews/month"
                },
                "description": "Privacy-first web analytics that doesn't compromise on features or performance.",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "52"
                },
                "featureList": [
                  "Real-time analytics dashboard",
                  "Cookieless tracking",
                  "GDPR compliance",
                  "Performance monitoring",
                  "API access",
                  "Custom events"
                ]
              })
            }}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
} 