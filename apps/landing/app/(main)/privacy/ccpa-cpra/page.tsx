import Background from "@/app/components/background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FadeIn from "@/app/components/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { 
  Shield, 
  Lock, 
  Database,
  FileCheck,
  Cookie,
  UserX,
  User,
  CheckCircle,
  FileText,
  Clock,
  Scale,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  GlobeLock,
  Building,
  Eye,
  UserRoundX,
  UserCog,
  DollarSign,
  ScrollText
} from "lucide-react";

// Define metadata for SEO
export const metadata: Metadata = {
  title: "CCPA & CPRA Compliance | Databuddy Analytics",
  description: "Learn about CCPA & CPRA and how Databuddy Analytics ensures compliance with California's consumer privacy regulations through privacy-first analytics.",
  keywords: "CCPA, CPRA, California privacy, consumer privacy, data protection, privacy analytics, compliance, cookieless tracking, data privacy, privacy regulations",
  alternates: {
    canonical: 'https://www.databuddy.cc/privacy/ccpa-cpra',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.databuddy.cc/privacy/ccpa-cpra',
    title: 'CCPA & CPRA Compliance | Databuddy Analytics',
    description: "Learn about CCPA & CPRA and how Databuddy Analytics ensures compliance with California's consumer privacy regulations.",
    siteName: 'Databuddy Analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCPA & CPRA Compliance | Databuddy Analytics',
    description: "Learn about CCPA & CPRA and how Databuddy Analytics ensures compliance with California's consumer privacy regulations.",
    creator: '@databuddyps',
  },
};

// CCPA/CPRA Page Component
export default function CCPACPRAPage() {
  const consumerRights = [
    {
      title: "Right to Know",
      description: "Consumers can request information about what personal data is collected, how it's used, and whether it's sold or shared with third parties.",
      icon: Eye
    },
    {
      title: "Right to Delete",
      description: "Consumers can request deletion of their personal information, with certain exceptions for necessary business operations.",
      icon: UserX
    },
    {
      title: "Right to Opt-Out",
      description: "Consumers can opt-out of the sale or sharing of their personal information, including for cross-context behavioral advertising.",
      icon: UserRoundX
    },
    {
      title: "Right to Non-Discrimination",
      description: "Consumers cannot be discriminated against for exercising their CCPA/CPRA rights, including in terms of price or service quality.",
      icon: Scale
    },
    {
      title: "Right to Correct",
      description: "Added by CPRA, consumers can request corrections to inaccurate personal information.",
      icon: FileCheck
    },
    {
      title: "Right to Limit Use of Sensitive Data",
      description: "CPRA allows consumers to limit the use and disclosure of sensitive personal information to necessary purposes.",
      icon: Lock
    },
    {
      title: "Right to Opt-Out of Automated Decision-Making",
      description: "Under CPRA, consumers can opt-out of profiling and automated decision-making technology.",
      icon: UserCog
    }
  ];

  const businessObligations = [
    {
      title: "Notice at Collection",
      description: "Businesses must inform consumers about categories of personal information collected and purposes of use at the time of collection.",
      icon: FileText,
      color: "from-amber-400 to-orange-500"
    },
    {
      title: "Privacy Policy Disclosures",
      description: "Detailed privacy policy must disclose data practices, consumer rights, and how to exercise those rights.",
      icon: ScrollText,
      color: "from-blue-400 to-indigo-500"
    },
    {
      title: "Data Subject Request Processes",
      description: "Businesses must establish clear procedures to handle and respond to consumer requests within 45 days.",
      icon: User,
      color: "from-emerald-400 to-green-500"
    },
    {
      title: "Reasonable Security Measures",
      description: "Implementation of appropriate security measures to protect personal information from unauthorized access.",
      icon: Shield,
      color: "from-red-400 to-rose-500"
    },
    {
      title: "Service Provider Requirements",
      description: "Written contracts with service providers and contractors restricting their use of personal information.",
      icon: Building,
      color: "from-purple-400 to-violet-500"
    },
    {
      title: "Data Minimization",
      description: "CPRA requires collection and processing of only the necessary personal information for disclosed purposes.",
      icon: Database,
      color: "from-teal-400 to-cyan-500"
    },
    {
      title: "Honor Opt-Out Preference Signals",
      description: "Respect technical opt-out signals like Global Privacy Control (GPC) for sale/sharing of data.",
      icon: GlobeLock,
      color: "from-sky-400 to-blue-500"
    }
  ];

  const databuddyFeatures = [
    {
      title: "Cookieless Tracking",
      description: "Our technology doesn't rely on cookies for analytics, reducing requirements for opt-out mechanisms under CCPA/CPRA.",
      icon: Cookie
    },
    {
      title: "Data Minimization By Design",
      description: "Engineered to collect only essential data, aligning with CPRA's data minimization requirements.",
      icon: Database
    },
    {
      title: "Enhanced Transparency",
      description: "Clear, accessible information about data practices to help our clients meet CCPA/CPRA disclosure requirements.",
      icon: FileText
    },
    {
      title: "Limited Data Sharing",
      description: "Minimal third-party data sharing reduces exposure to CCPA/CPRA obligations regarding the sale and sharing of personal information.",
      icon: Shield
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        <main className="pt-8" itemScope itemType="https://schema.org/WebPage">
          {/* Hero section */}
          <FadeIn>
            <div className="container mx-auto px-4 py-16 max-w-6xl relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
              <div className="absolute bottom-0 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
              
              <div className="text-center mb-8 relative">
                <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-5 border border-amber-500/20" aria-hidden="true">
                  <Shield className="h-6 w-6 text-amber-400" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 mb-6" itemProp="headline">
                  Understanding CCPA & CPRA
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10" itemProp="description">
                  The California Consumer Privacy Act and California Privacy Rights Act and their impact on data privacy in the digital age
                </p>
              </div>
              
              {/* Scroll indicator */}
              <div className="flex justify-center mt-12">
                <div className="animate-bounce flex flex-col items-center text-slate-400">
                  <span className="text-sm mb-2">Scroll to learn more</span>
                  <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center">
                    <div className="w-1 h-2 bg-slate-400 rounded-full mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Content wrapper */}
          <div className="relative">
            {/* Background accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
              <div className="absolute top-1/4 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" aria-hidden="true" />
              <div className="absolute top-1/3 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" aria-hidden="true" />
              <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" aria-hidden="true" />
            </div>

            {/* What are CCPA & CPRA section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-12 shadow-lg hover:shadow-amber-900/5 transition-all duration-300">
                  <h2 className="text-3xl font-bold mb-6 flex items-center">
                    <span className="bg-amber-500/10 p-2 rounded-lg mr-3">
                      <Shield className="h-6 w-6 text-amber-400" />
                    </span>
                    What are CCPA & CPRA?
                  </h2>
                  <div className="space-y-4">
                    <p className="text-slate-300">
                      The California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA) are comprehensive privacy laws designed to enhance privacy rights and consumer protection for residents of California. <span className="text-amber-400 font-medium">The CCPA, which took effect on January 1, 2020, was the first major consumer privacy law in the United States.</span> The CPRA, sometimes called "CCPA 2.0," was approved in November 2020 and became effective on January 1, 2023, significantly expanding and strengthening the original CCPA.
                    </p>
                    <p className="text-slate-300">
                      These groundbreaking laws give California residents unprecedented control over their personal information and impose significant obligations on businesses that collect and process this data. <span className="text-amber-400 font-medium">They represent California's response to growing concerns about data privacy in the digital age and align with global privacy trends, moving closer to the standards set by the European Union's General Data Protection Regulation (GDPR).</span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-amber-400 font-medium">The CPRA notably established the California Privacy Protection Agency (CPPA), a dedicated enforcement body,</span> and introduced stronger protections for sensitive personal information, reflecting the increased importance of data privacy in today's digital economy.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-4">Scope & Applicability</h3>
                    <p className="text-slate-300 mb-4">
                      The CCPA/CPRA applies to for-profit businesses that collect personal information from California residents, determine the purposes of processing, and do business in California, if they meet one of these thresholds:
                    </p>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Annual gross revenue exceeding $25 million (adjusted to $26.625 million by 2025)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Annually buys, sells, or shares personal information of 100,000+ California residents or households</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Derives 50% or more of annual revenue from selling/sharing California residents' personal information</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-4">Key Differences: CPRA vs CCPA</h3>
                    <p className="text-slate-300 mb-4">
                      The CPRA significantly enhanced the original CCPA with several important changes:
                    </p>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Created the California Privacy Protection Agency (CPPA) for dedicated enforcement</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Added special protections for sensitive personal information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Expanded consumer rights, including the right to correct inaccurate information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Extended to "sharing" of data for cross-context behavioral advertising</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Removed B2B and employee data exemptions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Consumer Rights Section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-5 border border-amber-500/20" aria-hidden="true">
                    <User className="h-6 w-6 text-amber-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Consumer Rights Under CCPA/CPRA</h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    The CCPA and CPRA grant California residents significant rights over their personal data
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {consumerRights.map((right, index) => (
                    <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex items-start">
                        <div className="bg-amber-500/10 p-2 rounded-lg mr-4 mt-1">
                          <right.icon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{right.title}</h3>
                          <p className="text-slate-300">{right.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Business Obligations Section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-5 border border-amber-500/20" aria-hidden="true">
                    <Building className="h-6 w-6 text-amber-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Business Obligations</h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    Businesses must fulfill several key obligations to comply with CCPA/CPRA
                  </p>
                </div>

                <div className="space-y-6 mb-12">
                  {businessObligations.map((obligation, index) => (
                    <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className={`bg-gradient-to-r ${obligation.color} p-2 rounded-lg mr-4`}>
                          <obligation.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold">{obligation.title}</h3>
                      </div>
                      <p className="text-slate-300 ml-12">{obligation.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Web Analytics Impact Section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-5 border border-amber-500/20" aria-hidden="true">
                    <Cookie className="h-6 w-6 text-amber-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Impact on Web Analytics</h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    The CCPA/CPRA has significant implications for how businesses implement web analytics and tracking technologies
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                        <FileText className="h-5 w-5 text-amber-400" />
                      </div>
                      Notice Requirements
                    </h3>
                    <p className="text-slate-300">
                      Businesses must provide clear information in privacy policies and at collection points about cookies and tracking technologies, detailing categories of data collected, purposes, and third parties involved.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                        <Cookie className="h-5 w-5 text-amber-400" />
                      </div>
                      Tracking Cookies & Consent
                    </h3>
                    <p className="text-slate-300">
                      Data collected through cookies is considered personal information. Businesses that sell or share this information must provide a "Do Not Sell or Share" link and honor opt-out signals like Global Privacy Control.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                        <Database className="h-5 w-5 text-amber-400" />
                      </div>
                      Analytics Processing
                    </h3>
                    <p className="text-slate-300">
                      When using analytics tools, businesses must provide opt-out mechanisms for data sold or shared for cross-context behavioral advertising, potentially requiring IP anonymization and limited data sharing.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                        <Eye className="h-5 w-5 text-amber-400" />
                      </div>
                      Transparency in Practice
                    </h3>
                    <p className="text-slate-300">
                      CCPA/CPRA mandates transparency in web analytics, requiring clear disclosures about data collection and respecting users' choices regarding the sale or sharing of their information collected through these technologies.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Enforcement & Penalties Section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-5 border border-amber-500/20" aria-hidden="true">
                    <DollarSign className="h-6 w-6 text-amber-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Enforcement & Penalties</h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    The CPPA and California Attorney General enforce these laws with significant penalties for non-compliance
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                        <DollarSign className="h-5 w-5 text-amber-400" />
                      </div>
                      Administrative Fines
                    </h3>
                    <p className="text-slate-300 mb-2">
                      The CPPA can impose civil penalties of:
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Up to $2,500 per unintentional violation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Up to $7,500 per intentional violation or violations involving minors</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Amounts adjusted for inflation every two years</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                        <Shield className="h-5 w-5 text-amber-400" />
                      </div>
                      Private Right of Action
                    </h3>
                    <p className="text-slate-300 mb-2">
                      For certain data breaches, consumers can seek:
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Statutory damages between $100-$750 per incident</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Significant collective damages for large-scale breaches</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-400 mr-2">•</span>
                        <span>Injunctive or declaratory relief</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg hover:border-amber-500/20 transition-all duration-300 mb-12">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="bg-amber-500/10 p-2 rounded-lg mr-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    Notable Enforcement Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-semibold mb-1 text-white">Sephora</h4>
                      <p className="text-slate-300 text-sm mb-1">2022</p>
                      <p className="text-slate-300">$1.2 million fine for failing to disclose data sales and honor opt-out requests.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-semibold mb-1 text-white">DoorDash</h4>
                      <p className="text-slate-300 text-sm mb-1">2024</p>
                      <p className="text-slate-300">$375,000 fine for issues related to opt-out provisions.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-semibold mb-1 text-white">Tilting Point Media</h4>
                      <p className="text-slate-300 text-sm mb-1">2024</p>
                      <p className="text-slate-300">$500,000 fine for violations concerning children's privacy.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-semibold mb-1 text-white">Honda</h4>
                      <p className="text-slate-300 text-sm mb-1">2025</p>
                      <p className="text-slate-300">$632,500 settlement for problems with consumer rights request processes.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
                  <div className="flex items-start">
                    <div className="bg-amber-500/20 p-2 rounded-lg mr-4 mt-1">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Compliance Challenges</h3>
                      <p className="text-slate-300">
                        Despite being in effect for several years, studies indicate only a small percentage of companies fully meet requirements. The average cost for manually processing a single Data Subject Access Request (DSAR) is approximately $1,524.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Databuddy Features Section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-5 border border-amber-500/20" aria-hidden="true">
                    <Shield className="h-6 w-6 text-amber-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How Databuddy Helps With CCPA/CPRA Compliance</h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    Our privacy-first analytics solutions are designed with CCPA/CPRA compliance in mind
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {databuddyFeatures.map((feature, index) => (
                    <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex items-start">
                        <div className="bg-amber-500/10 p-2 rounded-lg mr-4 mt-1">
                          <feature.icon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                          <p className="text-slate-300">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Conclusion Section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl p-8 md:p-12 border border-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
                  
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-full mb-5">
                      <CheckCircle className="h-8 w-8 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Key Takeaways</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/70">
                      <h3 className="text-xl font-semibold mb-3 text-white">Comprehensive Protection</h3>
                      <p className="text-slate-300">
                        The CCPA and CPRA provide California residents with unprecedented rights over their personal information and impose substantial obligations on businesses that collect this data.
                      </p>
                    </div>
                    
                    <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/70">
                      <h3 className="text-xl font-semibold mb-3 text-white">Growing Enforcement</h3>
                      <p className="text-slate-300">
                        As enforcement actions increase and consumer awareness grows, compliance with these laws is becoming increasingly important for businesses of all sizes.
                      </p>
                    </div>
                    
                    <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/70">
                      <h3 className="text-xl font-semibold mb-3 text-white">Proactive Compliance</h3>
                      <p className="text-slate-300">
                        The financial and reputational consequences of non-compliance are significant, making it essential for organizations to prioritize privacy in their data practices.
                      </p>
                    </div>
                    
                    <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800/70">
                      <h3 className="text-xl font-semibold mb-3 text-white">Privacy-First Approach</h3>
                      <p className="text-slate-300">
                        Databuddy's privacy-first analytics solutions help businesses navigate these complex requirements while still delivering the insights they need to succeed.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/demo">Try Databuddy Analytics</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
} 