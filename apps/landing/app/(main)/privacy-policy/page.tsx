import Background from "@/app/components/background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FadeIn from "@/app/components/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { 
  Shield, 
  Mail,
  ArrowRight,
  Lock,
  Eye,
  UserCheck,
  Clock,
  Trash2,
  GlobeIcon,
  FileText,
  AlertCircle,
  ShieldCheck,
  Share,
  BarChart3,
  UserX,
  Database,
  Cookie
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define metadata for SEO
export const metadata: Metadata = {
  title: "Privacy Policy | Databuddy",
  description: "Databuddy's comprehensive privacy policy for our privacy-first analytics service. Learn how we protect both customer and end user data with GDPR compliance and no user identification.",
  keywords: "privacy policy, data protection, GDPR, CCPA, data privacy, analytics privacy, privacy-first analytics, no tracking",
  alternates: {
    canonical: 'https://www.databuddy.cc/privacy-policy',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.databuddy.cc/privacy-policy',
    title: 'Privacy Policy | Databuddy',
    description: 'Learn about our privacy-first analytics approach and how we protect both customer and end user data.',
    siteName: 'Databuddy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Databuddy',
    description: 'Learn about our privacy-first analytics approach and how we protect both customer and end user data.',
    creator: '@databuddyps',
  },
};

interface ContentBlock {
  subtitle?: string;
  text?: string;
  items?: string[];
  note?: string;
  additionalText?: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: ContentBlock[];
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 3rd, 2025";
  
  const sections: Section[] = [
    {
      id: "who-this-applies-to",
      title: "Who This Policy Applies To",
      icon: <UserCheck className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "This privacy policy covers two groups of people:",
          items: [
            "<strong>Customers:</strong> Individuals or organizations who sign up for and use Databuddy's analytics services for their websites.",
            "<strong>End Users:</strong> Visitors to websites that use Databuddy analytics. If you're visiting a website that uses our analytics, this policy explains what data we collect about you and how we protect your privacy."
          ],
          note: "We are committed to privacy-first analytics that respects the rights of all users, whether they are our customers or visitors to websites using our service."
        }
      ]
    },
    {
      id: "our-privacy-principles",
      title: "Our Privacy-First Principles",
      icon: <ShieldCheck className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "Databuddy is built on privacy-first principles that guide everything we do:",
          items: [
            "<strong>No User Identification:</strong> We never identify individual users or track them across websites or sessions.",
            "<strong>No Personal Data Collection:</strong> We don't collect names, email addresses, or any personally identifiable information from website visitors.",
            "<strong>No Cross-Site Tracking:</strong> We don't use cookies, fingerprinting, or other techniques to track users across different websites.",
            "<strong>IP Address Anonymization:</strong> We immediately anonymize IP addresses and never store them in their original form.",
            "<strong>Aggregated Data Only:</strong> All analytics data is aggregated and anonymized, making it impossible to identify individual users.",
            "<strong>No Data Sales:</strong> We never sell or share user data with third parties for advertising or marketing purposes.",
            "<strong>Minimal Data Collection:</strong> We only collect what's necessary to provide meaningful analytics insights."
          ]
        }
      ]
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: <Database className="h-5 w-5 text-sky-400" />,
      content: [
        {
          subtitle: "From Our Customers (Website Owners)",
          text: "When you sign up for Databuddy, we collect:",
          items: [
            "Account information: Email address, name (optional), and password",
            "Billing information: Payment details, billing address, and contact information for subscriptions",
            "Website information: Domain names and website URLs you want to track",
            "Usage data: How you use our dashboard and analytics features",
            "Communications: Support requests, feedback, and survey responses"
          ]
        },
        {
          subtitle: "From End Users (Website Visitors)",
          text: "When someone visits a website using Databuddy analytics, we collect minimal, anonymized data:",
          items: [
            "Page views: Which pages were visited (URL path only, no query parameters containing personal data)",
            "Referrer information: Which website or search engine led to the visit (domain only)",
            "Technical information: Browser type, operating system, device type, and screen resolution",
            "Geographic location: Country and region only (derived from anonymized IP address)",
            "Session data: Time spent on site, bounce rate, and navigation patterns (anonymized)",
            "User preferences: Dark/light mode, language settings (if available)"
          ],
          note: "Important: We immediately anonymize IP addresses using a one-way hash function. We never store IP addresses in their original form, and it's impossible for us to identify individual users from the data we collect."
        }
      ]
    },
    {
      id: "no-cookies-no-tracking",
      title: "No Cookies, No Tracking",
      icon: <UserX className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "Unlike traditional analytics services, Databuddy is designed to respect user privacy:",
          items: [
            "<strong>No Cookies:</strong> We don't use cookies or any cross-site tracking to track users",
            "<strong>No Fingerprinting:</strong> We don't create browser fingerprints or use device characteristics to identify users",
            "<strong>No Cross-Site Tracking:</strong> We can't and don't track users as they move between different websites",
            "<strong>No User Profiles:</strong> We don't build profiles of individual users or their browsing habits",
          ],
          additionalText: "This means end users visiting websites with Databuddy analytics enjoy complete privacy while still allowing website owners to understand their site's performance."
        }
      ]
    },
    {
      id: "how-we-use-information",
      title: "How We Use Information",
      icon: <BarChart3 className="h-5 w-5 text-sky-400" />,
      content: [
        {
          subtitle: "Customer Data Usage",
          text: "We use customer information to:",
          items: [
            "Provide and maintain our analytics service",
            "Process payments and manage subscriptions",
            "Send important service updates and security notifications",
            "Provide customer support and respond to inquiries",
            "Improve our service based on usage patterns",
            "Ensure compliance with legal obligations"
          ]
        },
        {
          subtitle: "End User Data Usage",
          text: "We use anonymized end user data solely to:",
          items: [
            "Generate aggregated analytics reports for website owners",
            "Provide insights about website performance and user experience",
            "Help website owners understand their audience demographics (country/region level only)",
            "Monitor our service performance and detect technical issues"
          ],
          note: "End user data is never used for advertising, marketing, or any purpose other than providing analytics insights to website owners."
        }
      ]
    },
    {
      id: "data-sharing",
      title: "How We Share Information",
      icon: <Share className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We have strict limits on how we share data:",
          items: [
            "<strong>Customer Data:</strong> Only shared with essential service providers (payment processors, hosting providers) under strict data processing agreements",
            "<strong>End User Data:</strong> Only shared with the website owner whose site the user visited, and only in aggregated, anonymized form",
            "<strong>Legal Requirements:</strong> We may disclose data if required by law, but we will notify affected users unless legally prohibited",
            "<strong>Business Transfers:</strong> In case of merger or acquisition, data would be transferred under the same privacy protections",
            "<strong>No Third-Party Sales:</strong> We never sell unanonymized user data to advertisers, data brokers, or marketing companies"
          ],
          note: "We have never shared user data with law enforcement or government agencies, and we would challenge any overly broad requests."
        }
      ]
    },
    {
      id: "gdpr-compliance",
      title: "GDPR and Privacy Rights",
      icon: <Shield className="h-5 w-5 text-sky-400" />,
      content: [
        {
          subtitle: "Legal Basis for Processing",
          text: "Under GDPR, our legal basis for processing data is:",
          items: [
            "<strong>Customer Data:</strong> Contractual necessity (to provide our service) and legitimate interests (service improvement)",
            "<strong>End User Data:</strong> Legitimate interests of website owners to understand their site performance, balanced against user privacy rights"
          ]
        },
        {
          subtitle: "Your Rights (Customers)",
          text: "As a customer, you have the right to:",
          items: [
            "<strong>Access:</strong> Request copies of your personal data",
            "<strong>Rectification:</strong> Correct inaccurate information",
            "<strong>Erasure:</strong> Request deletion of your account and data",
            "<strong>Portability:</strong> Export your data in a machine-readable format",
            "<strong>Restriction:</strong> Limit how we process your data",
            "<strong>Objection:</strong> Object to processing based on legitimate interests"
          ]
        },
        {
          subtitle: "End User Rights",
          text: "As an end user (website visitor), you have the right to:",
          items: [
            "<strong>Information:</strong> Know what data is collected (detailed in this policy)",
            "<strong>Objection:</strong> Object to analytics tracking (use browser Do Not Track or ad blockers)",
            "<strong>Erasure:</strong> Since we don't identify individuals, we can't delete specific user data, but all data is automatically deleted according to our retention policies"
          ],
          note: "Because we don't identify individual end users, many traditional rights don't apply, but this actually provides stronger privacy protection."
        }
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: <Clock className="h-5 w-5 text-sky-400" />,
      content: [
        {
          subtitle: "Customer Data",
          text: "We retain customer data for:",
          items: [
            "Account information: Until account deletion + 30 days for processing",
            "Billing records: 7 years for tax and accounting compliance",
            "Support communications: 3 years for service improvement"
          ]
        },
        {
          subtitle: "Analytics Data",
          text: "We retain anonymized analytics data for:",
          items: [
            "Standard plans: 24 months of historical data",
            "Premium plans: Up to 5 years of historical data",
            "Raw event data: 90 days before aggregation",
            "Aggregated reports: Retained according to plan limits"
          ],
          additionalText: "Customers can configure shorter retention periods or request early deletion of their analytics data at any time."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We implement comprehensive security measures:",
          items: [
            "<strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)",
            "<strong>Access Controls:</strong> Strict employee access controls with multi-factor authentication",
            "<strong>Infrastructure:</strong> Hosted on secure, SOC 2 certified cloud infrastructure",
            "<strong>Monitoring:</strong> 24/7 security monitoring and automated threat detection",
            "<strong>Data Minimization:</strong> We collect and store only what's necessary",
            "<strong>Anonymization:</strong> IP addresses are immediately anonymized using cryptographic hashes"
          ],
          note: "Our privacy-first approach means that even in the unlikely event of a data breach, individual users cannot be identified from the analytics data we store."
        }
      ]
    },
    {
      id: "data-location",
      title: "Data Location and Storage",
      icon: <GlobeIcon className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "All Databuddy data is stored exclusively within the European Union:",
          items: [
            "<strong>EU-Only Storage:</strong> All customer data and analytics data is stored only in secure data centers within the European Union",
            "<strong>No International Transfers:</strong> We do not transfer personal data outside the EU/EEA",
            "<strong>GDPR Compliance:</strong> By keeping all data within the EU, we ensure full GDPR compliance without requiring additional transfer mechanisms",
            "<strong>Data Sovereignty:</strong> Your data remains under EU jurisdiction and protection at all times"
          ],
          note: "This EU-only approach provides the strongest possible privacy protection for both our customers and end users visiting tracked websites."
        }
      ]
    },
    {
      id: "do-not-track",
      title: "Do Not Track and User Control",
      icon: <UserX className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We respect user privacy preferences:",
          items: [
            "<strong>Do Not Track:</strong> We honor browser Do Not Track signals and will not collect analytics data when enabled",
            "<strong>Ad Blockers:</strong> Our analytics respects ad blocker preferences and won't track users who block analytics",
            "<strong>GDPR Consent:</strong> Website owners using our service should implement appropriate consent mechanisms for EU visitors",
            "<strong>Opt-out:</strong> Users can opt out of analytics on any website by enabling Do Not Track in their browser"
          ],
          note: "Because we don't use cookies or persistent identifiers, users automatically get privacy protection without needing to opt out."
        }
      ]
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      icon: <FileText className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We may update this Privacy Policy to reflect changes in our practices or legal requirements:",
          items: [
            "Material changes will be notified via email to customers and prominently displayed on our website",
            "Non-material changes will be updated with a new 'Last Updated' date",
            "We maintain a changelog of privacy policy updates for transparency",
            "Customers will be given 30 days notice before any material changes take effect"
          ],
          additionalText: "We encourage you to review this policy periodically to stay informed about how we protect your privacy."
        }
      ]
    }
  ];
  
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        <main className="pt-8" itemScope itemType="https://schema.org/WebPage">
          {/* Header section */}
          <FadeIn>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-sky-500/10 rounded-full mb-5 border border-sky-500/20">
                  <Shield className="h-7 w-7 text-sky-400" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-4">
                  Privacy Policy
                </h1>
                <p className="text-slate-300 mb-4">
                  Last Updated: <span className="text-white">{lastUpdated}</span>
                </p>
                <p className="max-w-2xl mx-auto text-slate-400">
                  This policy explains how we collect, use, and protect information for both our customers and end users. We're committed to privacy-first analytics that respects everyone's privacy.
                </p>
              </div>
              
              {/* Privacy-first highlight */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-3 flex items-center text-green-400">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Privacy-First Analytics
                </h2>
                <p className="text-slate-300 mb-3">
                  Databuddy provides website analytics without compromising user privacy. We don't use cookies, don't track individual users, and never collect personal information from website visitors.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center text-green-400">
                    <UserX className="h-4 w-4 mr-2" />
                    <span className="text-sm">No User Tracking</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <Cookie className="h-4 w-4 mr-2" />
                    <span className="text-sm">No Cookies</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm">GDPR Compliant</span>
                  </div>
                </div>
              </div>
              
              {/* Table of contents */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-12">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-sky-400" />
                  Table of Contents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sections.map((section) => (
                    <a 
                      key={section.id} 
                      href={`#${section.id}`} 
                      className="text-sky-400 hover:text-sky-300 flex items-center py-1.5 group"
                    >
                      <span className="opacity-70 group-hover:opacity-100 mr-2">{section.icon}</span>
                      <span className="group-hover:underline underline-offset-2">{section.title}</span>
                    </a>
                  ))}
                </div>
              </div>
              
              <Separator className="my-8 bg-slate-800/50" />
              
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="lead text-lg text-slate-300">
                  Databuddy (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a privacy-first analytics service that provides website insights without compromising user privacy. This Privacy Policy describes how we collect, use, and protect information when you use our service or visit websites that use our analytics.
                </p>
                
                {/* Render policy sections */}
                {sections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24 bg-slate-900/30 border border-slate-800 rounded-xl p-6 my-8 hover:border-slate-700 transition-all">
                    <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
                      <span className="p-2 bg-slate-800 rounded-lg mr-3 inline-flex">
                        {section.icon}
                      </span>
                      {section.title}
                    </h2>
                    
                    {section.content.map((contentBlock, index) => (
                      <div key={contentBlock.subtitle || index} className="mb-6">
                        {contentBlock.subtitle && (
                          <h3 className="text-xl font-semibold mb-2 text-slate-100">{contentBlock.subtitle}</h3>
                        )}
                        
                        {contentBlock.text && (
                          <p className="mb-3 text-slate-300">{contentBlock.text}</p>
                        )}
                        
                        {contentBlock.items && contentBlock.items.length > 0 && (
                          <ul className="space-y-2 mb-4">
                            {contentBlock.items.map((item, i) => (
                              <li key={`item-${section.id}-${index}-${i}`} className="flex items-start">
                                <span className="text-sky-400 mr-2 mt-1.5">•</span>
                                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
                                <span className="text-slate-300" dangerouslySetInnerHTML={{ __html: item }}/>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {contentBlock.note && (
                          <div className="bg-sky-950/30 border border-sky-900/50 rounded-lg p-4 my-4">
                            <p className="text-sm text-slate-300">
                              <span className="font-semibold text-sky-400">Note:</span> {contentBlock.note}
                            </p>
                          </div>
                        )}
                        
                        {contentBlock.additionalText && (
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                          <p className="text-slate-300 mt-2" dangerouslySetInnerHTML={{ __html: contentBlock.additionalText }}/>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Contact Us */}
                <div id="contact-us" className="scroll-mt-24 bg-gradient-to-r from-sky-900/20 to-blue-900/20 rounded-xl p-6 my-8 border border-sky-500/20">
                  <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
                    <span className="p-2 bg-slate-800 rounded-lg mr-3 inline-flex">
                      <Mail className="h-5 w-5 text-sky-400" />
                    </span>
                    Contact Us
                  </h2>
                  
                  <p className="text-slate-300 mb-4">
                    If you have any questions about this Privacy Policy, want to exercise your privacy rights, or have concerns about how your data is handled, please contact us:
                  </p>
                  
                  <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 mt-4 mb-6">
                    <p className="flex items-center text-sky-400 mb-3">
                      <Mail className="h-5 w-5 mr-2" />
                      <a href="mailto:privacy@databuddy.cc" className="hover:underline">privacy@databuddy.cc</a>
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      We typically respond to privacy inquiries within 24 hours, and will fulfill data subject requests within 30 days as required by GDPR.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-slate-900/70 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Privacy First, Always</h2>
                <p className="text-slate-300 mb-4">
                  Want to learn more about our privacy-first approach to analytics and how we're different from traditional analytics services?
                </p>
                <Button asChild variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20">
                  <Link href="/privacy" className="flex items-center gap-1">
                    Learn about our privacy-first analytics
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </main>
        <Footer />
      </div>
    </div>
  );
} 