import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { competitors, Competitor } from "../data";

// Import Navbar and Footer components
const Navbar = dynamic(() => import("@/app/components/navbar"), { ssr: true });
const Footer = dynamic(() => import("@/app/components/footer"), { ssr: true });

// Rating component
const RatingBar = ({ rating, label }: { rating: number; label: string }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-medium text-white">{rating}/5</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            rating <= 2 ? 'bg-red-500' : 
            rating === 3 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`} 
          style={{ width: `${(rating / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

// Generate static params for all competitors
export function generateStaticParams() {
  return competitors
    .filter(c => c.id !== "Databuddy")
    .map((competitor) => ({
      competitor: competitor.id,
    }));
}

// Generate metadata for each competitor page
export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor: competitorSlug } = await params;
  const competitor = competitors.find(c => c.id === competitorSlug);
  
  if (!competitor) {
    return {
      title: "Competitor Comparison | Databuddy Analytics",
      description: "Compare Databuddy Analytics with other analytics platforms."
    };
  }
  
  return {
    title: `Databuddy vs ${competitor.name} Comparison | Analytics Platform Comparison`,
    description: `See how Databuddy Analytics compares to ${competitor.name}. Detailed feature comparison, strengths, limitations, and why Databuddy is the better choice.`,
    keywords: [
      `analytics comparison`, 
      `${competitor.name} alternative`, 
      `Databuddy vs ${competitor.name}`, 
      `${competitor.name} vs Databuddy`,
      `privacy-first analytics`, 
      `web analytics comparison`,
      `${competitor.name} analytics review`,
      `best ${competitor.name} alternatives`,
      `${competitor.id} vs databuddy`,
      `analytics platform comparison`,
      `${competitor.name.toLowerCase()} pricing comparison`,
      `${competitor.name.toLowerCase()} features`,
      `privacy focused analytics`,
      `GDPR compliant analytics`,
      `better than ${competitor.name.toLowerCase()}`,
      `${competitor.name.toLowerCase()} pros and cons`
    ],
    openGraph: {
      title: `Databuddy vs ${competitor.name} | Analytics Platform Comparison`,
      description: `See how Databuddy Analytics compares to ${competitor.name}. Detailed feature comparison, strengths, limitations, and why Databuddy is the better choice.`,
      type: "website",
      url: `/compare/${competitor.id}`,
    },
  };
}

export default async function CompetitorComparisonPage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor: competitorSlug } = await params;
  
  // Find the competitor data
  const competitor = competitors.find(c => c.id === competitorSlug);
  const databuddyData = competitors.find(c => c.id === "Databuddy");
  
  if (!competitor || !databuddyData) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 relative">
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Competitor Not Found
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                The competitor you&apos;re looking for doesn&apos;t exist in our comparison database.
              </p>
              <Link 
                href="/compare"
                className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                View All Comparisons
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 relative">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-80 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-600">
                Databuddy vs {competitor.name}
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how Databuddy stacks up against {competitor.name}. We&apos;ve analyzed the key features, privacy considerations, and performance metrics to help you make an informed decision.
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Databuddy Card */}
                <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <span className="mr-2">Databuddy</span>
                      <Badge className="bg-sky-500 text-white">Our Platform</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-6">{databuddyData.overview}</p>
                  </CardContent>
                </Card>
                
                {/* Competitor Card */}
                <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">{competitor.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-6">{competitor.overview}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Strengths Comparison */}
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sky-400">Databuddy</h3>
                  <ul className="space-y-2">
                    {databuddyData.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-slate-200 mt-6">{competitor.name}</h3>
                  <ul className="space-y-2">
                    {competitor.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Weaknesses Comparison */}
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Limitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sky-400">Databuddy</h3>
                  <ul className="space-y-2">
                    {databuddyData.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-slate-200 mt-6">{competitor.name}</h3>
                  <ul className="space-y-2">
                    {competitor.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Ratings Comparison */}
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Databuddy Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingBar rating={databuddyData.ratings.privacy} label="Privacy" />
                <RatingBar rating={databuddyData.ratings.easeOfUse} label="Ease of Use" />
                <RatingBar rating={databuddyData.ratings.features} label="Features" />
                <RatingBar rating={databuddyData.ratings.pricing} label="Pricing Value" />
                <RatingBar rating={databuddyData.ratings.performance} label="Performance" />
                <RatingBar rating={databuddyData.ratings.customization} label="Customization" />
                
                <div className="mt-6 space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Target Audience:</span>
                    <p className="text-white">{databuddyData.ratings.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Data Ownership:</span>
                    <p className="text-white">{databuddyData.ratings.dataOwnership}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">{competitor.name} Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingBar rating={competitor.ratings.privacy} label="Privacy" />
                <RatingBar rating={competitor.ratings.easeOfUse} label="Ease of Use" />
                <RatingBar rating={competitor.ratings.features} label="Features" />
                <RatingBar rating={competitor.ratings.pricing} label="Pricing Value" />
                <RatingBar rating={competitor.ratings.performance} label="Performance" />
                <RatingBar rating={competitor.ratings.customization} label="Customization" />
                
                <div className="mt-6 space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Target Audience:</span>
                    <p className="text-white">{competitor.ratings.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Data Ownership:</span>
                    <p className="text-white">{competitor.ratings.dataOwnership}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-12">
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Why Choose Databuddy Over {competitor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{competitor.outshine}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Compare With Other Analytics Platforms</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {competitors
                .filter(c => c.id !== "Databuddy" && c.id !== competitorSlug)
                .map((comp) => (
                  <Link 
                    key={comp.id}
                    href={`/compare/${comp.id}`}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-white transition-colors"
                  >
                    vs {comp.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 