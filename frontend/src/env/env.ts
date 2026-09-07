let cached: { API_URL: string; WEBSOCKET_URL: string } | null = null;

// Les URLs sont servies au RUNTIME par /api/config (elles lisent le
// process.env du conteneur, donc modifiables via le .env de docker sans
// rebuild). En secours, on retombe sur les valeurs inlinées au build.
export default async function getEnv() {
	if (cached) return cached;
	try {
		const res = await fetch('/api/config', { cache: 'no-store' });
		if (res.ok) {
			cached = (await res.json()) as { API_URL: string; WEBSOCKET_URL: string };
		}
	} catch {
		// /api/config indisponible (ex. build statique) → valeurs locales
	}
	cached ??= {
		API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
		WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3002',
	};
	return cached;
}