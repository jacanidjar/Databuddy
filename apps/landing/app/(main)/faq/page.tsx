import Background from "@/app/components/background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FadeIn from "@/app/components/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareText, ShieldCheck, Zap, Database, Server, Boxes, Sparkles, DollarSign, Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Frequently Asked Questions | Databuddy Analytics",
  description: "Find answers to common questions about Databuddy Analytics, including privacy features, pricing, performance, and more.",
  openGraph: {
    title: "Frequently Asked Questions | Databuddy Analytics",
    description: "Find answers to common questions about Databuddy Analytics, including privacy features, pricing, performance, and more.",
    type: "website",
    url: "https://www.databuddy.cc/faq",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions | Databuddy Analytics",
    description: "Find answers to common questions about Databuddy Analytics, including privacy features, pricing, performance, and more.",
  },
};

// FAQ categories with their questions and answers
const faqCategories = [
  {
    id: "general",
    name: "General",
    icon: <MessageSquareText className="h-4 w-4" />,
    color: "from-blue-500 to-sky-400",
    questions: [
      {
        question: "How is Databuddy different from Google Analytics?",
        answer: "Databuddy is built for privacy-first analytics with no cookies required, making it GDPR and CCPA compliant out of the box. Our script is 65x faster than GA4, with a <1KB footprint that won't impact your Core Web Vitals. Plus, our interface delivers actionable insights without the complexity – most teams see value within 15 minutes of installation."
      },
      {
        question: "What's included in the free plan?",
        answer: "Our free plan includes up to 50,000 monthly pageviews, real-time analytics, basic event tracking, and 30-day data retention. It's perfect for small websites, personal projects, or to test Databuddy before upgrading. You'll get access to all core features with no artificial limitations on functionality."
      },
      {
        question: "How easy is it to implement Databuddy on my website?",
        answer: "Implementation takes less than 5 minutes for most websites. Simply add our lightweight script to your site (we provide easy integrations for Next.js, React, WordPress, Shopify, and more), and you'll start seeing data immediately. No complex configuration required – though advanced customization options are available when you need them."
      },
      {
        question: "Can I migrate my historical data from another analytics platform?",
        answer: "Yes, we offer migration tools for Google Analytics, Matomo, and other major platforms. While we can't import every data point (due to our privacy-first approach), we can bring over aggregated historical trends to ensure continuity in your reporting. Our migration specialists will help you through the entire process."
      },
      {
        question: "What kind of support do you offer?",
        answer: "All paid plans include priority email support with responses within 24 hours. Business and Enterprise plans receive dedicated Slack support with 4-hour response times during business hours. We also provide comprehensive documentation, implementation guides, and regular webinars to help you get the most from Databuddy."
      }
    ]
  },
  {
    id: "privacy",
    name: "Privacy",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "from-emerald-500 to-green-400",
    questions: [
      {
        question: "Do I need to add cookie consent banners with Databuddy?",
        answer: "No. Databuddy's analytics are completely cookieless, using privacy-preserving techniques to provide accurate analytics without tracking individual users. Our customers typically see a 30% increase in conversion rates after removing those intrusive cookie banners while still getting the insights they need."
      },
      {
        question: "How accurate is cookieless analytics compared to traditional methods?",
        answer: "Our cookieless analytics are 95-98% accurate compared to cookie-based solutions. For most businesses, this slight difference is far outweighed by the benefits: higher conversion rates (no consent banners), better data collection (no blocked cookies), and simplified compliance. Many customers report more accurate data overall since we aren't blocked by ad-blockers or privacy browsers."
      },
      {
        question: "Is Databuddy GDPR and CCPA compliant?",
        answer: "Absolutely. Databuddy is built from the ground up to comply with global privacy regulations including GDPR, CCPA, and others. Our cookieless approach means you don't need consent banners, and we anonymize all data to protect visitor privacy while still providing valuable insights."
      },
      {
        question: "What data does Databuddy collect?",
        answer: "We collect only anonymous, non-personally identifiable information such as: pages visited, time spent on pages, browser type, operating system, device type, referrer URL (domain only), screen dimensions, language preferences, anonymized IP address (for general geolocation only), and interaction events. We never collect personal information that could identify individual users."
      },
      {
        question: "Is my data secure with Databuddy?",
        answer: "Absolutely. We employ industry-leading security practices including end-to-end encryption, regular security audits, and SOC 2 compliance. Your data is stored in EU-based servers with strict access controls. We never sell your data or use it for any purpose other than providing you with analytics insights."
      }
    ]
  },
  {
    id: "performance",
    name: "Performance",
    icon: <Zap className="h-4 w-4" />,
    color: "from-amber-500 to-yellow-400",
    questions: [
      {
        question: "How does Databuddy impact my site's performance?",
        answer: "Databuddy has minimal impact on your site's performance. Our tracking script is 247x smaller than Google Analytics (just 1.5KB vs 371KB), loads 6x faster (30-50ms vs 234ms), has 2-5x lighter CPU impact (0.8-1.5% vs 3-6%), and uses 10x less energy. This means faster page loads, better Core Web Vitals scores, and improved SEO rankings."
      },
      {
        question: "How does Databuddy handle high-traffic sites?",
        answer: "Our infrastructure is built to scale, handling millions of events per minute with sub-second processing times. We use a distributed architecture that automatically scales with your traffic patterns. For enterprise customers with extreme traffic needs (50M+ monthly pageviews), we offer dedicated infrastructure options to ensure optimal performance."
      },
      {
        question: "Will Databuddy slow down my website?",
        answer: "No. Our tracking script is designed to be non-blocking and asynchronous, meaning it won't delay your page from loading. At just 1.5KB, it loads in milliseconds and has minimal CPU impact, even on mobile devices. Many customers actually see performance improvements after switching from heavier analytics solutions."
      }
    ]
  },
  {
    id: "features",
    name: "Features",
    icon: <Sparkles className="h-4 w-4" />,
    color: "from-purple-500 to-indigo-400",
    questions: [
      {
        question: "Can I track custom events and conversions?",
        answer: "Yes! Beyond standard pageview analytics, you can track custom events, goals, and conversion funnels. Our event tracking API is simple to implement and allows you to measure specific user actions like button clicks, form submissions, purchases, and more. Most customers set up their first conversion funnel within 30 minutes of installation."
      },
      {
        question: "How does Databuddy use AI to enhance analytics?",
        answer: "Our AI capabilities transform raw data into actionable insights through several key features: natural language queries that let you ask questions about your data in plain English, anomaly detection that automatically identifies unusual patterns, predictive analytics that forecast future trends, and automated reports that summarize findings in clear business language. This means less time interpreting data and more time acting on insights."
      },
      {
        question: "What custom dashboards and reporting options are available?",
        answer: "Databuddy offers flexible dashboards that you can customize to show the metrics that matter most to your business. You can create and save multiple dashboard views, schedule automated reports to be delivered via email, and export data in various formats (CSV, PDF, etc.). Our upcoming AI-powered reporting will automatically highlight key insights and anomalies."
      },
      {
        question: "Does Databuddy support heatmaps and session recordings?",
        answer: "Heatmaps are on our roadmap and will be available soon, allowing you to visualize where users click, move, and scroll on your pages. We're designing our heatmap solution to be privacy-focused while still providing valuable insights. Session recordings are not currently planned as they raise significant privacy concerns."
      }
    ]
  },
  {
    id: "dataos",
    name: "Data OS",
    icon: <Boxes className="h-4 w-4" />,
    color: "from-sky-500 to-blue-400",
    questions: [
      {
        question: "What is Databuddy's Data OS approach and how does it benefit me?",
        answer: "Databuddy functions as a complete Data Operating System, not just an analytics tool. This means you can use our platform as an interoperable data layer that powers your entire digital ecosystem. Benefits include: real-time event streaming for instant reactions to user behavior, a plugin ecosystem for custom extensions, self-hosting options for maximum control, and seamless integration with your existing data infrastructure. This approach gives you more flexibility and value than traditional analytics platforms."
      },
      {
        question: "What is the plugin ecosystem?",
        answer: "Our plugin ecosystem allows you to extend Databuddy's capabilities with both official and community-created extensions. These plugins can add new visualization types, integrate with third-party services, or implement custom tracking mechanisms. You can also develop your own plugins using our developer API if you have specific needs."
      },
      {
        question: "Can I self-host Databuddy?",
        answer: "Self-hosting options are on our roadmap for enterprise customers who need maximum control over their data. This will allow you to deploy Databuddy on your own infrastructure while still benefiting from our regular updates and features. Our self-hosting solution will include comprehensive documentation and support to ensure a smooth setup process."
      },
      {
        question: "How does the Data Warehouse Sync work?",
        answer: "Our upcoming Data Warehouse Sync feature will automatically export your analytics data to your existing data warehouse (such as BigQuery, Snowflake, or Redshift). This allows you to combine your analytics data with other business data sources for comprehensive business intelligence and advanced analysis, all while maintaining privacy compliance."
      }
    ]
  },
  {
    id: "pricing",
    name: "Pricing",
    icon: <DollarSign className="h-4 w-4" />,
    color: "from-pink-500 to-rose-400",
    questions: [
      {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can change your plan at any time. Changes take effect on your next billing cycle, and you'll only be charged for what you use."
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 14-day money-back guarantee if you're not satisfied with our service. No questions asked."
      },
      {
        question: "Do you offer custom plans for larger businesses?",
        answer: "Yes, we offer enterprise plans with custom features, dedicated support, and volume pricing. Contact our sales team to learn more."
      },
      {
        question: "What happens if I exceed my monthly pageview limit?",
        answer: "If you exceed your monthly pageview limit, we'll continue collecting data and notify you about the overage. You'll have the option to upgrade to a higher plan or pay a small overage fee for the additional pageviews. We won't suddenly stop collecting data or surprise you with a large bill."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="relative min-h-screen bg-slate-950">
      <Background />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-sky-950/20 to-transparent pointer-events-none" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -left-40 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-[20%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pb-16">
          <FadeIn>
            <div className="pt-28 pb-8 md:pt-36 lg:pt-40">
              <div className="container px-4 mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-4">
                  Frequently Asked Questions
                </h1>
                <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                  Everything you need to know about Databuddy Analytics. Can&apos;t find the answer you&apos;re looking for?{" "}
                  <Link href="/contact" className="text-sky-400 hover:text-sky-300 font-medium">
                    Reach out to our team
                  </Link>
                  .
                </p>
{/* 
                <div className="relative flex items-center max-w-md mx-auto mt-8 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative w-full bg-slate-900/90 border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search questions..." 
                      className="bg-transparent border-none outline-none text-sm placeholder:text-slate-500 text-slate-300 w-full focus:ring-0" 
                      aria-label="Search questions"
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="container mx-auto px-4 max-w-4xl">
              <Tabs defaultValue="general" className="w-full">
                {/* Category Tabs */}
                <TabsList className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-2 mb-8 flex justify-between overflow-x-auto">
                  {faqCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="rounded-lg py-2 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500/20 data-[state=active]:to-blue-600/20 data-[state=active]:text-white data-[state=active]:border-sky-500/50 data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2 min-w-max border border-transparent data-[state=active]:border-sky-500/30"
                    >
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      <span>{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {faqCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-0 animate-in fade-in-50 duration-300">
                    <Card className="bg-slate-900/30 border-slate-800 shadow-lg overflow-hidden">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/60 to-slate-900/60 px-6 py-4 border-b border-slate-800/50">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <h2 className="text-xl font-bold text-white">{category.name} Questions</h2>
                      </div>
                      <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                          {category.questions.map((faq, index) => (
                            <AccordionItem 
                              key={index} 
                              value={`${category.id}-item-${index}`} 
                              className="border-b border-slate-800/50 last:border-0"
                            >
                              <AccordionTrigger className="text-left font-medium py-5 px-6 text-base hover:text-sky-400 transition-colors">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-slate-300 pb-5 px-6 text-sm leading-relaxed">
                                <div className="pt-2 pb-1 border-l-2 border-sky-500/30 pl-4">
                                  {faq.answer}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="mt-16">
                <Card className="bg-gradient-to-b from-slate-900/60 to-slate-900/80 border-slate-800 overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
                  </div>
                  <CardContent className="relative p-8 text-center">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 mb-4">Still have questions?</h2>
                    <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                      We&apos;re here to help! Reach out to our team for answers to any other questions you may have about Databuddy Analytics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20 border-0">
                        <Link href="/contact">Contact Support</Link>
                      </Button>
                      <Button asChild variant="outline" className="border-slate-700 hover:border-sky-500 text-slate-300 hover:text-sky-400">
                        <Link href="/demo">Try Databuddy</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </main>
        <Footer />
      </div>
    </div>
  );
} 