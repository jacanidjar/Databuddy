export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { KubiksSDK } = await import('@kubiks/otel-nextjs');

		const sdk = new KubiksSDK({
			service: 'your-service-name',
		});

		sdk.start();
	}
}
