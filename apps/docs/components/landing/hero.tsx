"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Play } from "lucide-react";

export default function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div className="relative z-10 md:w-10/12 mx-auto font-geist md:border-l-0 md:border-b-0 md:border-[1.2px] border-border rounded-none -pr-2 bg-background/95 backdrop-blur-sm">
				<div className="w-full md:mx-0">
					{/* Main hero content */}
					<div className="border-l-[1.2px] border-t-[1.2px] border-border md:border-t-0 p-16 md:p-20 text-center">
						<div className="max-w-4xl mx-auto">
							{/* Badge */}
							<div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 backdrop-blur-sm px-4 py-2 mb-8">
								<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
								<span className="text-sm text-muted-foreground">
									Web analytics that don&apos;t suck
								</span>
							</div>

							{/* Main headline */}
							<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
								<span className="text-foreground">Databuddy, analytics</span>
								<br />
								<span className="text-foreground">that <strong>don&apos;t suck</strong></span>
							</h1>

							{/* Subheadline */}
							<p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
								No cookies, no banners, no slow dashboards. Just the data you care about, tracked in a way that actually makes sense.
							</p>

							{/* Clean CTA buttons */}
							<div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
								<Link
									href="https://app.databuddy.cc/register"
									className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-300 bg-primary rounded-2xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background shadow-2xl hover:shadow-primary/10 transform hover:scale-105 hover:-translate-y-1"
								>
									<span className="flex items-center gap-2">
										Get started
										<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
									</span>
								</Link>

								<Link
									href="/demo"
									className="group inline-flex items-center justify-center px-8 py-4 text-base font-medium text-muted-foreground transition-all duration-300 bg-muted/50 backdrop-blur-sm border border-border rounded-2xl hover:bg-muted hover:border-border/80 hover:text-foreground transform hover:scale-105"
								>
									<Play className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
									View live demo
								</Link>
							</div>

							{/* Key stats - theme aware */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
								<div className="text-center group">
									<div className="flex items-center justify-center gap-3 mb-2">
										<div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
											<Zap className="w-5 h-5 text-primary" />
										</div>
										<span className="text-3xl font-bold text-foreground">65x</span>
									</div>
									<p className="text-sm text-muted-foreground">Faster than GA4</p>
								</div>
								<div className="text-center group">
									<div className="flex items-center justify-center gap-3 mb-2">
										<div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
											<Shield className="w-5 h-5 text-primary" />
										</div>
										<span className="text-3xl font-bold text-foreground">100%</span>
									</div>
									<p className="text-sm text-muted-foreground">GDPR Compliant</p>
								</div>
								<div className="text-center group">
									<div className="flex items-center justify-center gap-3 mb-2">
										<div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
											<Users className="w-5 h-5 text-primary" />
										</div>
										<span className="text-3xl font-bold text-foreground">500+</span>
									</div>
									<p className="text-sm text-muted-foreground">Companies trust us</p>
								</div>
							</div>
						</div>
					</div>

					{/* Trust indicators */}
					<div className="border-l-[1.2px] border-t-[1.2px] border-border p-10 bg-muted/20 backdrop-blur-sm">
						<div className="flex flex-col md:flex-row items-center justify-between gap-6">
							<div className="flex items-center gap-6">
								<span className="text-sm text-muted-foreground">Trusted by developers at</span>
								<div className="flex items-center gap-4 text-muted-foreground">
									<span className="text-sm hover:text-foreground transition-colors cursor-default">Rivo.gg</span>
									<span className="text-sm hover:text-foreground transition-colors cursor-default">Better-auth</span>
									<span className="text-sm hover:text-foreground transition-colors cursor-default">Confinity</span>
									<span className="text-sm hover:text-foreground transition-colors cursor-default">Wouldyoubot</span>
									<span className="text-sm text-muted-foreground">+496 more</span>
								</div>
							</div>
							<div className="flex items-center gap-6 text-xs text-muted-foreground">
								<span className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-primary rounded-full" />
									Free 30-day trial
								</span>
								<span className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-primary rounded-full" />
									No credit card required
								</span>
								<span className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 bg-primary rounded-full" />
									Setup in 5 minutes
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}