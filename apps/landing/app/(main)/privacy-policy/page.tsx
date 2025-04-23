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
  Share
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define metadata for SEO
export const metadata: Metadata = {
  title: "Privacy Policy | Databuddy",
  description: "Databuddy&apos;s privacy policy details how we collect, use, and protect your information in compliance with global privacy regulations.",
  keywords: "privacy policy, data protection, GDPR, CCPA, data privacy, analytics privacy",
  alternates: {
    canonical: 'https://www.databuddy.cc/privacy-policy',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.databuddy.cc/privacy-policy',
    title: 'Privacy Policy | Databuddy',
    description: 'Learn about how Databuddy collects, uses, and protects your information.',
    siteName: 'Databuddy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Databuddy',
    description: 'Learn about how Databuddy collects, uses, and protects your information.',
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
  const lastUpdated = "March 1, 2024";
  
  const sections: Section[] = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: <Eye className="h-5 w-5 text-sky-400" />,
      content: [
        {
          subtitle: "Information You Provide to Us",
          text: "We collect information you provide directly to us, including:",
          items: [
            "Account information: When you create an account, we collect your name, email address, and password.",
            "Billing information: When you purchase a subscription, we collect payment information, billing address, and contact details.",
            "Communications: Information you provide when you contact us for support, provide feedback, or respond to surveys."
          ]
        },
        {
          subtitle: "Information We Collect Automatically",
          text: "When you use our services, we automatically collect certain information about your device and usage, including:",
          items: [
            "Device information: Browser type, operating system, device type, and screen size.",
            "Usage data: Pages viewed, time spent on pages, referring sources, and navigation paths through our site.",
            "Performance data: System performance metrics, error rates, and diagnostic information."
          ],
          note: "While we collect this data, we implement privacy-preserving techniques: We anonymize IP addresses and do not store them in their original form. We do not use cookies for tracking purposes. We do not identify individual users across sessions or websites."
        }
      ]
    },
    {
      id: "how-we-use-information",
      title: "How We Use Information",
      icon: <UserCheck className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We use the information we collect to:",
          items: [
            "Provide, maintain, and improve our services",
            "Process transactions and send transaction-related communications",
            "Respond to your comments, questions, and requests",
            "Send technical notices, updates, security alerts, and administrative messages",
            "Monitor and analyze trends, usage, and activities in connection with our services",
            "Detect, prevent, and address technical issues"
          ]
        }
      ]
    },
    {
      id: "how-we-share-information",
      title: "How We Share Information",
      icon: <Share className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We may share the information we collect in the following circumstances:",
          items: [
            "<strong>Service Providers:</strong> With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.",
            "<strong>Compliance with Laws:</strong> If required to do so by law or in response to valid requests by public authorities.",
            "<strong>Business Transfers:</strong> In connection with a merger, sale of company assets, financing, or acquisition of all or a portion of our business.",
            "<strong>With Your Consent:</strong> In other cases where we explicitly tell you we're sharing your information and receive your consent."
          ],
          note: "We do not sell your personal information to third parties."
        }
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: <Clock className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We retain personal information for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.",
          items: [],
          additionalText: "We implement automated data retention policies to ensure data is only kept as long as necessary, with customizable timeframes to match your compliance needs."
        }
      ]
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: <ShieldCheck className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "Depending on your location, you may have certain rights regarding your personal information:",
          items: [
            "<strong>Access:</strong> You can request copies of your personal information.",
            "<strong>Correction:</strong> You can request that we correct inaccurate information about you.",
            "<strong>Deletion:</strong> You can request that we delete your personal information.",
            "<strong>Restriction:</strong> You can request that we restrict the processing of your information.",
            "<strong>Data Portability:</strong> You can request a machine-readable copy of your information.",
            "<strong>Objection:</strong> You can object to our processing of your information based on our legitimate interests."
          ],
          additionalText: "To exercise these rights, please contact us at <a href=\"mailto:privacy@databuddy.cc\" className=\"text-sky-400 hover:text-sky-300\">privacy@databuddy.cc</a>."
        }
      ]
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: <GlobeIcon className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We process and store information in the United States and other countries. If you are located outside the United States, we may transfer your information to countries that may have different data protection laws than your country.",
          items: [],
          additionalText: "We take appropriate measures to ensure your personal information remains protected in accordance with this Privacy Policy, including through the use of Standard Contractual Clauses and other legal mechanisms for transfers from the EU/EEA/UK."
        }
      ]
    },
    {
      id: "security",
      title: "Security",
      icon: <Lock className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We use reasonable organizational, technical, and administrative measures designed to protect the security and confidentiality of information under our control. However, no data transmission or storage system is 100% secure.",
          items: []
        }
      ]
    },
    {
      id: "childrens-privacy",
      title: "Children's Privacy",
      icon: <AlertCircle className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "Our services are not directed to children under the age of 16, and we do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us.",
          items: []
        }
      ]
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      icon: <FileText className="h-5 w-5 text-sky-400" />,
      content: [
        {
          text: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date. For significant changes, we will provide additional notice, such as a prominent website notice or an email notification.",
          items: []
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
                  This policy explains how we collect, use, and protect your information. We&apos;re committed to transparency and protecting your privacy.
                </p>
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
                  This Privacy Policy describes how Databuddy (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and shares information when you use our website, products, and services. We are committed to protecting your privacy and ensuring you have a positive experience on our website and while using our products and services.
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
                      <div key={contentBlock.subtitle} className="mb-6">
                        {contentBlock.subtitle && (
                          <h3 className="text-xl font-semibold mb-2 text-slate-100">{contentBlock.subtitle}</h3>
                        )}
                        
                        {contentBlock.text && (
                          <p className="mb-3 text-slate-300">{contentBlock.text}</p>
                        )}
                        
                        {contentBlock.items && contentBlock.items.length > 0 && (
                          <ul className="space-y-2 mb-4">
                            {contentBlock.items.map((item, i) => (
                              <li key={item} className="flex items-start">
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
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                  </p>
                  
                  <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 mt-4 mb-6">
                    <p className="flex items-center text-sky-400 mb-3">
                      <Mail className="h-5 w-5 mr-2" />
                      <a href="mailto:privacy@databuddy.cc" className="hover:underline">privacy@databuddy.cc</a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-slate-900/70 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Privacy First, Always</h2>
                <p className="text-slate-300 mb-4">
                  Want to learn more about our privacy-first approach to analytics?
                </p>
                <Button asChild variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20">
                  <Link href="/privacy-focus" className="flex items-center gap-1">
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