import Background from "@/app/components/background";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FadeIn from "@/app/components/FadeIn";
import dynamic from "next/dynamic";
import { Linkedin, Mail, MapPin, Phone } from "lucide-react";
// import { obfuscateEmail } from "@/lib/utils";

const Contact = dynamic(() => import("@/app/components/contact"), { ssr: true });

export const metadata = {
  title: "Contact Us | Databuddy",
  description: "Get in touch with the Databuddy team for questions, support, or to learn more about our privacy-first analytics solution.",
  alternates: {
    canonical: 'https://www.databuddy.cc/contact',
  },
};

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-sky-400" />,
      title: "Email Us",
      details: "hello@databuddy.cc",
      description: "For general inquiries and information",
    },
    {
      icon: <Phone className="h-6 w-6 text-sky-400" />,
      title: "Book a meeting",
      details: "https://calendly.com/eassanassar/meeting-1-on-1",
      description: "Weekdays, 15:00 - 20:00",
    },
    {
      icon: <Linkedin className="h-6 w-6 text-sky-400" />,
      title: "Contact us on LinkedIn",
      details: "https://www.linkedin.com/company/databuddyps",
      description: "We're a remote-first company",
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Background />
      <div className="relative z-10 h-full overflow-auto scrollbar-hide">
        <Navbar />
        <main>
          <FadeIn>
            <div className="container mx-auto px-4 py-16 max-w-6xl">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 mb-4">
                  Get in Touch
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  Have questions about Databuddy? Our team is here to help you implement 
                  the right analytics solution for your business.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {contactInfo.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.title === "Email Us" ? `mailto:${item.details}` : item.details}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.title}: ${item.details}`}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-sky-500/50 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 text-center block relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/0 to-blue-500/0 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                    <div className="mx-auto w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sky-400 font-medium mb-2 text-wrap break-words">{item.details}</p>
                    <p className="text-slate-300 text-sm">{item.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="bg-slate-900/30 py-16">
              <div className="container mx-auto px-4 rounded-xl">
                <Contact />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="container mx-auto px-4 py-16 max-w-6xl">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Can&apos;t find the answer you&apos;re looking for? Reach out to our customer support team.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">How quickly can I get set up with Databuddy?</h3>
                    <p className="text-slate-300">
                      Most customers are up and running within minutes. Simply add our tracking script to your website and you&apos;ll start seeing data immediately.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Do you offer custom plans for larger businesses?</h3>
                    <p className="text-slate-300">
                      Yes, we offer enterprise plans with custom features, dedicated support, and volume pricing. Contact our sales team to learn more.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Is Databuddy GDPR compliant?</h3>
                    <p className="text-slate-300">
                      Absolutely. Our cookieless tracking is fully compliant with GDPR, CCPA, and other privacy regulations without requiring consent banners.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Can I migrate my data from Google Analytics?</h3>
                    <p className="text-slate-300">
                     Yes, we make the transition smooth by importing your historical data, while still being compliant with privacy regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </main>
        <Footer />
      </div>
    </div>
  );
} 