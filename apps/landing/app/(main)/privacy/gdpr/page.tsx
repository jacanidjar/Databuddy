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
  ArrowRight
} from "lucide-react";

// Define metadata for SEO
export const metadata: Metadata = {
  title: "GDPR Compliance | Databuddy Analytics",
  description: "Learn about GDPR and how Databuddy Analytics ensures compliance with the General Data Protection Regulation through cookieless tracking and privacy-first approaches.",
  keywords: "GDPR, data protection, privacy analytics, GDPR compliance, cookieless tracking, data privacy, privacy regulations, EU privacy law",
  alternates: {
    canonical: 'https://www.databuddy.cc/privacy/gdpr',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.databuddy.cc/privacy/gdpr',
    title: 'GDPR Compliance | Databuddy Analytics',
    description: 'Learn about GDPR and how Databuddy Analytics ensures compliance with the General Data Protection Regulation.',
    siteName: 'Databuddy Analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GDPR Compliance | Databuddy Analytics',
    description: 'Learn about GDPR and how Databuddy Analytics ensures compliance with the General Data Protection Regulation.',
    creator: '@databuddyps',
  },
};

// GDPR Page Component
export default function GDPRPage() {
  const gdprPrinciples = [
    {
      title: "Lawfulness, Fairness & Transparency",
      description: "Personal data must be processed legally, honestly, and in a way that is clear and understandable to the individual.",
      icon: Scale,
      color: "from-blue-400 to-indigo-500"
    },
    {
      title: "Purpose Limitation",
      description: "Personal data should only be collected for specified, legitimate purposes and not used for unrelated purposes without consent.",
      icon: FileCheck,
      color: "from-purple-400 to-violet-500"
    },
    {
      title: "Data Minimization",
      description: "Organizations should only collect and retain personal data that is strictly necessary for the stated purpose.",
      icon: Database,
      color: "from-emerald-400 to-green-500"
    },
    {
      title: "Accuracy",
      description: "Personal data must be correct and kept up to date, with mechanisms in place for individuals to rectify inaccurate information.",
      icon: CheckCircle,
      color: "from-teal-400 to-cyan-500"
    },
    {
      title: "Storage Limitation",
      description: "Personal data should only be kept for as long as needed to fulfill its purpose, after which it should be securely disposed of or anonymized.",
      icon: Clock,
      color: "from-amber-400 to-orange-500"
    },
    {
      title: "Integrity & Confidentiality",
      description: "Organizations must implement technical and organizational measures to protect personal data against unauthorized access or breaches.",
      icon: Lock,
      color: "from-red-400 to-rose-500"
    },
    {
      title: "Accountability",
      description: "Organizations are responsible for complying with all principles and must be able to demonstrate their adherence through policies and documentation.",
      icon: FileText,
      color: "from-sky-400 to-blue-500"
    }
  ];

  const individualRights = [
    {
      title: "Right to be Informed",
      description: "Individuals have the right to know what personal data is being collected, how it will be used, for how long, and with whom it will be shared.",
      icon: BookOpen
    },
    {
      title: "Right of Access",
      description: "Individuals can request confirmation that their data is being processed and obtain a copy of that data along with other relevant information.",
      icon: User
    },
    {
      title: "Right to Rectification",
      description: "Individuals can request correction of inaccurate or incomplete personal data.",
      icon: FileCheck
    },
    {
      title: "Right to Erasure",
      description: "Also known as the 'right to be forgotten,' individuals can request deletion of their personal data in certain circumstances.",
      icon: UserX
    },
    {
      title: "Right to Restrict Processing",
      description: "Individuals can request limitations on how their personal data is processed in specific situations.",
      icon: Lock
    },
    {
      title: "Right to Data Portability",
      description: "Individuals can receive their personal data in a structured, commonly used format to transmit to another data controller.",
      icon: Database
    },
    {
      title: "Right to Object",
      description: "Individuals can object to processing of their personal data in certain circumstances, including for direct marketing.",
      icon: AlertTriangle
    }
  ];

  const databuddyFeatures = [
    {
      title: "Cookieless Tracking",
      description: "Our technology doesn't rely on cookies or local storage for analytics, eliminating many GDPR consent requirements.",
      icon: Cookie
    },
    {
      title: "Data Anonymization",
      description: "All data is anonymized at collection. IP addresses are hashed and truncated to protect individual identities.",
      icon: Shield
    },
    {
      title: "Purpose-Built Compliance",
      description: "Designed from the ground up with GDPR principles in mind, rather than retrofitting privacy into existing systems.",
      icon: FileText
    },
    {
      title: "Minimal Data Collection",
      description: "We only collect what's necessary for analytics, adhering to the data minimization principle of GDPR.",
      icon: Database
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
              <div className="absolute top-0 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
              <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
              
              <div className="text-center mb-8 relative">
                <div className="inline-flex items-center justify-center p-2 bg-sky-500/10 rounded-full mb-5 border border-sky-500/20" aria-hidden="true">
                  <Shield className="h-6 w-6 text-sky-400" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-6" itemProp="headline">
                  Understanding GDPR
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10" itemProp="description">
                  The General Data Protection Regulation and how it impacts user data privacy in the digital age
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
              <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" aria-hidden="true" />
              <div className="absolute top-1/3 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" aria-hidden="true" />
              <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl" aria-hidden="true" />
            </div>

            {/* What is GDPR section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-4xl relative">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-12 shadow-lg hover:shadow-sky-900/5 transition-all duration-300">
                  <h2 className="text-3xl font-bold mb-6 flex items-center">
                    <span className="bg-sky-500/10 p-2 rounded-lg mr-3">
                      <Shield className="h-6 w-6 text-sky-400" />
                    </span>
                    What is GDPR?
                  </h2>
                  <div className="space-y-4">
                    <p className="text-slate-300">
                      The General Data Protection Regulation (GDPR) is a comprehensive legal framework designed to protect the privacy and security of personal data for individuals within the European Union. <span className="text-sky-400 font-medium">Enacted by the EU and effective since May 25, 2018, GDPR represents a significant shift in how personal data is handled online.</span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-sky-400 font-medium">GDPR's primary objectives include giving individuals greater control over their personal information and ensuring organizations are accountable for how they process this data.</span> The regulation standardizes data protection laws across all EU member states and European Economic Area (EEA) countries, providing a consistent set of rights and obligations.
                    </p>
                    <p className="text-slate-300">
                      This modernization of data protection rules aligns with today's digital society, where online interactions and cloud services are commonplace. <span className="text-sky-400 font-medium">GDPR recognizes data privacy as a fundamental right and empowers individuals to manage their digital footprint.</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg hover:border-sky-500/20 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-4">Global Reach</h3>
                    <p className="text-slate-300 mb-4">
                      GDPR extends beyond EU borders. Any organization worldwide that targets or collects data from individuals within the EU must comply, regardless of the organization's location.
                    </p>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-sky-400 mr-2">•</span>
                        <span>Applies to businesses offering goods or services to individuals in the EU</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-sky-400 mr-2">•</span>
                        <span>Includes organizations monitoring online behavior of individuals within the EU</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-sky-400 mr-2">•</span>
                        <span>Covers both commercial businesses and non-profit organizations</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg hover:border-sky-500/20 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-4">Substantial Penalties</h3>
                    <p className="text-slate-300 mb-4">
                      Non-compliance with GDPR can result in significant financial penalties, underscoring the importance of data protection.
                    </p>
                    <div className="space-y-5">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 font-medium">Maximum GDPR Fine</span>
                          <span className="text-xl font-bold text-red-400">€20 million</span>
                        </div>
                        <div className="text-slate-400 text-sm">or 4% of global annual turnover, whichever is higher</div>
                        <div className="text-slate-500 text-xs mt-1">Source: GDPR Article 83(5)</div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 font-medium">Total GDPR Fines (as of Jan 2025)</span>
                          <span className="text-xl font-bold text-red-400">€5.88 billion</span>
                        </div>
                        <div className="text-slate-500 text-xs">Source: European Data Protection Board Annual Report</div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 font-medium">Largest Single Fine</span>
                          <span className="text-xl font-bold text-red-400">€1.2 billion</span>
                        </div>
                        <div className="text-slate-400 text-sm">Against Meta in 2023</div>
                        <div className="text-slate-500 text-xs">Imposed by the Irish Data Protection Commission</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Section connector */}
                <div className="flex justify-center my-8">
                  <div className="h-16 w-px bg-gradient-to-b from-slate-800 to-transparent"></div>
                </div>
              </div>
            </FadeIn>

            {/* GDPR Principles */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center mb-12">
                  <span className="inline-block bg-indigo-500/10 text-indigo-400 rounded-full px-3 py-1 text-sm font-medium mb-3">Core Principles</span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">The 7 Pillars of GDPR</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    GDPR operates on seven fundamental principles that form the foundation of the regulation and ensure a consistent approach to data protection.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {gdprPrinciples.map((principle) => (
                    <div key={principle.title} className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-sky-500/30 hover:shadow-sky-900/5 transition-all duration-300">
                      <div className="flex items-start mb-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${principle.color} mr-4`}>
                          <principle.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{principle.title}</h3>
                      </div>
                      <p className="text-slate-300">{principle.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Section connector */}
                <div className="flex justify-center my-8">
                  <div className="h-16 w-px bg-gradient-to-b from-slate-800 to-transparent"></div>
                </div>
              </div>
            </FadeIn>

            {/* Individual Rights */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center mb-12">
                  <span className="inline-block bg-purple-500/10 text-purple-400 rounded-full px-3 py-1 text-sm font-medium mb-3">GDPR Rights</span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Individual Rights Under GDPR</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    GDPR grants individuals a comprehensive set of rights regarding their personal data, empowering them to take control of their digital information.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {individualRights.map((right) => (
                    <div key={right.title} className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 shadow-lg hover:shadow-purple-900/5 hover:border-purple-500/20 transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-full mr-3">
                          <right.icon className="h-5 w-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold">{right.title}</h3>
                      </div>
                      <p className="text-slate-300 text-sm">{right.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 border border-purple-500/20 rounded-xl bg-purple-500/5 p-4 shadow-lg max-w-4xl mx-auto">
                  <p className="text-slate-300 text-sm italic text-center">
                    These rights apply to all EU citizens and residents, regardless of where the data processing organization is located. They give individuals unprecedented control over how their personal data is used and processed.
                  </p>
                </div>
                
                {/* Section connector */}
                <div className="flex justify-center my-8">
                  <div className="h-16 w-px bg-gradient-to-b from-slate-800 to-transparent"></div>
                </div>
              </div>
            </FadeIn>

            {/* Web Analytics and GDPR */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-12">
                  <span className="inline-block bg-teal-500/10 text-teal-400 rounded-full px-3 py-1 text-sm font-medium mb-3">Web Analytics</span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Analytics Under GDPR</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    The use of web analytics has been significantly impacted by GDPR, particularly concerning the collection and processing of user data.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-10 shadow-lg transition-all duration-300 hover:shadow-teal-900/5">
                  <h3 className="text-2xl font-bold text-white mb-6">Web Analytics and GDPR</h3>
                  <div className="space-y-4">
                    <p className="text-slate-300">
                      Websites commonly employ web analytics to track user behavior, understand website traffic, and improve user experience. Under GDPR, the use of tracking cookies and the processing of personal data for analytics generally require explicit consent from the user.
                    </p>
                    <p className="text-slate-300">
                      This means that websites can no longer rely on implied consent or pre-checked boxes; users must actively and affirmatively agree to the collection of their data for these purposes. The consent obtained must be freely given, specific, informed, and unambiguous.
                    </p>
                    
                    {/* Analytics statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-sky-400 mb-2">62%</span>
                        <p className="text-slate-300 text-sm mb-1">of websites use cookie-based analytics that require consent</p>
                        <p className="text-slate-400 text-xs">Source: W3Techs Web Technology Survey, 2024</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-sky-400 mb-2">91%</span>
                        <p className="text-slate-300 text-sm mb-1">of users are concerned about their online privacy</p>
                        <p className="text-slate-400 text-xs">Source: Cisco Consumer Privacy Survey</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-sky-400 mb-2">43%</span>
                        <p className="text-slate-300 text-sm mb-1">of users reject cookie consent when given a clear choice</p>
                        <p className="text-slate-400 text-xs">Source: CookiePro Consent Benchmark Report</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300">
                      Websites are also obligated to provide transparent information about their use of cookies and data processing practices in their privacy policies. This includes detailing the types of cookies used, their purpose, the data collected, and whether this data is shared with any third parties.
                    </p>
                    <p className="text-slate-300">
                      Moreover, it must be as easy for users to withdraw their consent as it was to grant it. This emphasis on explicit consent and transparency has led to the widespread implementation of cookie consent banners and a greater awareness among internet users regarding online tracking practices.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-slate-900/50 border border-red-900/20 rounded-xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold mb-4 text-red-400 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Traditional Analytics Challenges
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Requires explicit user consent for cookie-based tracking</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Involves complex consent management systems</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Often collects personal data requiring additional compliance measures</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Increases legal risk and potential for significant fines</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>May alienate privacy-conscious visitors</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 border border-green-900/20 rounded-xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      The Databuddy Approach
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>Cookieless tracking eliminates need for consent banners</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>Data anonymization at collection protects user identities</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>Minimal data collection aligns with data minimization principle</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>Built-in compliance reduces legal risk</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>Privacy-first approach builds trust with your audience</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Visual comparison arrow */}
                <div className="hidden md:flex justify-center items-center my-6">
                  <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-sky-400" />
                  </div>
                </div>
                
                {/* Section connector */}
                <div className="flex justify-center my-8">
                  <div className="h-16 w-px bg-gradient-to-b from-slate-800 to-transparent"></div>
                </div>
              </div>
            </FadeIn>

            {/* How Databuddy Ensures GDPR Compliance */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center mb-12">
                  <span className="inline-block bg-sky-500/10 text-sky-400 rounded-full px-3 py-1 text-sm font-medium mb-3">The Solution</span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">How Databuddy Ensures GDPR Compliance</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    Our privacy-first analytics solution is designed to help you gain valuable insights while maintaining full GDPR compliance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {databuddyFeatures.map((feature) => (
                    <div key={feature.title} className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-sky-500/30 hover:shadow-sky-900/5 transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 mr-4">
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                      </div>
                      <p className="text-slate-300">{feature.description}</p>
                      <div className="mt-4">
                        <Link href="/privacy" className="text-sky-400 hover:text-sky-300 text-sm flex items-center">
                          Learn more <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* CTA section */}
            <FadeIn delay={100}>
              <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="bg-gradient-to-r from-sky-900/20 to-blue-900/20 rounded-2xl p-8 md:p-12 border border-sky-500/20 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
                  <div className="md:flex items-center justify-between">
                    <div className="mb-8 md:mb-0 md:mr-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Privacy without compromise</h2>
                      <p className="text-slate-300 md:text-lg max-w-xl">
                        Get the analytics you need while staying fully GDPR compliant with Databuddy's privacy-first approach.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
                        <Link href="/demo">Try for Free</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
          
          {/* Navigation dots */}
          <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
            <a href="#" className="w-3 h-3 rounded-full bg-sky-500/50 hover:bg-sky-500 transition-colors" aria-label="Go to introduction"></a>
            <a href="#" className="w-3 h-3 rounded-full bg-slate-700 hover:bg-sky-500 transition-colors" aria-label="Go to GDPR principles"></a>
            <a href="#" className="w-3 h-3 rounded-full bg-slate-700 hover:bg-sky-500 transition-colors" aria-label="Go to individual rights"></a>
            <a href="#" className="w-3 h-3 rounded-full bg-slate-700 hover:bg-sky-500 transition-colors" aria-label="Go to analytics impact"></a>
            <a href="#" className="w-3 h-3 rounded-full bg-slate-700 hover:bg-sky-500 transition-colors" aria-label="Go to Databuddy solution"></a>
          </div>
          
          {/* Structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "GDPR Compliance | Databuddy Analytics",
                "description": "Learn about GDPR and how Databuddy Analytics ensures compliance with the General Data Protection Regulation through cookieless tracking and privacy-first approaches.",
                "mainEntity": {
                  "@type": "Article",
                  "name": "Understanding GDPR Compliance",
                  "headline": "Understanding GDPR and How Databuddy Ensures Compliance",
                  "keywords": "GDPR, data protection, privacy analytics, cookieless tracking, data privacy, privacy regulations",
                  "datePublished": new Date().toISOString().split('T')[0],
                  "articleSection": "Privacy"
                }
              })
            }}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
} 