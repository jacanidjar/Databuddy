import Hero from "@/components/landing/hero";
import Features from "@/components/features";

// async function getGitHubStars() {
// 	try {
// 		const response = await fetch(
// 			"https://api.github.com/repos/databuddy-analytics",
// 			{
// 				headers: {
// 					Accept: "application/vnd.github.v3+json",
// 				},
// 				next: { revalidate: 3600 }, // Cache for 1 hour
// 			}
// 		);

// 		if (!response.ok) {
// 			throw new Error("Failed to fetch GitHub data");
// 		}

// 		const data = await response.json();
// 		return data.stargazers_count?.toLocaleString() || null;
// 	} catch (error) {
// 		console.error("Error fetching GitHub stars:", error);
// 		return null;
// 	}
// }

export default async function HomePage() {
	// const stars = await getGitHubStars();

	return (
		<div className="min-h-screen">
			<Hero />
			<Features stars={null} />

			{/* Trust Indicators Footer */}
			<div className="border-t border-neutral-200 dark:border-neutral-800 neutral-50">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-6">
							<span className="text-sm text-neutral-600 dark:text-neutral-400">
								Trusted by developers at
							</span>
							<div className="flex items-center gap-4 text-neutral-400">
								<span className="text-sm">Confinity</span>
								<span className="text-sm">Better-auth</span>
								<span className="text-sm">Rivo.gg</span>
								<span className="text-sm">Wouldyoubot</span>
							</div>
						</div>
						<div className="flex items-center gap-4 text-xs text-neutral-500">
              <span>
                <a href="https://www.better-auth.com" className="underline">Better-auth</a> inspired the design.
              </span>
							{/* <span className="flex items-center gap-1">
								<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-label="Checkmark" title="Checkmark">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								GDPR Compliant
							</span> */}
							{/* <span className="flex items-center gap-1">
								<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-label="Shield" title="Shield">
									<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
								</svg>
								SOC 2 Type II
							</span>
							<span className="flex items-center gap-1">
								<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-label="Checkmark" title="Checkmark">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								ISO 27001
							</span> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}