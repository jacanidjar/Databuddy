'use client';

import { authClient } from '@databuddy/auth/client';
import { SpinnerIcon } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

function VercelCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isProcessing, setIsProcessing] = useState(true);
	const [integrationData, setIntegrationData] = useState<{
		configurationId?: string;
		teamId?: string;
		next?: string;
		code?: string;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const code = searchParams.get('code');
		const configurationId = searchParams.get('configurationId');
		const teamId = searchParams.get('teamId');
		const next = searchParams.get('next');

		if (!code) {
			setError('Authorization code not found');
			setIsProcessing(false);
			return;
		}

		setIntegrationData({
			code,
			configurationId: configurationId || undefined,
			teamId: teamId || undefined,
			next: next || undefined,
		});
		setIsProcessing(false);
	}, [searchParams]);

	const handleConfirmIntegration = async () => {
		if (!integrationData?.code) {
			return;
		}

		setIsProcessing(true);
		try {
			const { data, error } = await authClient.oauth2.link({
				providerId: 'vercel',
				callbackURL: '/websites',
			});

			if (error) {
				setError(
					`Failed to connect Vercel account: ${error.message || 'Unknown error'}`
				);
				return;
			}

			if (integrationData.configurationId || integrationData.teamId) {
				// TODO: Store these details in the database
			}

			toast.success('Vercel account connected successfully!');
			router.push('/websites');
		} catch (error) {
			setError(
				`An error occurred while connecting your Vercel account: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleCancel = () => {
		router.push('/websites');
	};

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="w-full max-w-md rounded border border-destructive/20 bg-destructive/5 p-6 text-center">
					<div className="mb-4 text-4xl text-destructive">⚠️</div>
					<h1 className="mb-2 font-semibold text-destructive text-lg">
						Integration Failed
					</h1>
					<p className="mb-4 text-muted-foreground text-sm">{error}</p>
					<button
						className="rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
						onClick={handleCancel}
						type="button"
					>
						Go Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	if (isProcessing && !integrationData) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="relative mb-4">
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/20 blur-xl" />
						<SpinnerIcon className="relative mx-auto h-8 w-8 animate-spin text-primary" />
					</div>
					<h1 className="mb-2 font-semibold text-lg">
						Processing integration...
					</h1>
					<p className="text-muted-foreground text-sm">
						Please wait while we verify your request.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-lg rounded border bg-card p-6 shadow-lg">
				<div className="mb-6 text-center">
					<div className="mb-4 text-6xl">🔗</div>
					<h1 className="mb-2 font-bold text-2xl">Connect Vercel Account</h1>
					<p className="text-muted-foreground">
						You're about to connect your Vercel account to Databuddy
					</p>
				</div>

				<div className="mb-6 space-y-3 rounded bg-muted/50 p-4">
					<h3 className="font-medium text-sm">Integration Details:</h3>
					{integrationData?.configurationId && (
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Configuration ID:</span>
							<span className="font-mono text-xs">
								{integrationData.configurationId}
							</span>
						</div>
					)}
					{integrationData?.teamId && (
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Team ID:</span>
							<span className="font-mono text-xs">
								{integrationData.teamId}
							</span>
						</div>
					)}
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Provider:</span>
						<span>Vercel</span>
					</div>
				</div>

				<div className="mb-6 rounded border-blue-500 border-l-4 bg-blue-50 p-4 dark:bg-blue-950/20">
					<h4 className="mb-2 font-medium text-blue-800 text-sm dark:text-blue-200">
						What this integration will do:
					</h4>
					<ul className="space-y-1 text-blue-700 text-sm dark:text-blue-300">
						<li>• Access your Vercel projects and deployments</li>
						<li>• Monitor deployment analytics</li>
						<li>• Sync project data with Databuddy</li>
						<li>• Enable deployment notifications</li>
					</ul>
				</div>

				<div className="flex gap-3">
					<button
						className="flex-1 rounded border border-input bg-background px-4 py-2 font-medium hover:bg-accent hover:text-accent-foreground"
						disabled={isProcessing}
						onClick={handleCancel}
						type="button"
					>
						Cancel
					</button>
					<button
						className="flex-1 rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						disabled={isProcessing}
						onClick={handleConfirmIntegration}
						type="button"
					>
						{isProcessing ? (
							<>
								<SpinnerIcon className="mr-2 inline h-4 w-4 animate-spin" />
								Connecting...
							</>
						) : (
							'Connect Account'
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function VercelCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-background">
					<SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
				</div>
			}
		>
			<VercelCallbackContent />
		</Suspense>
	);
}
