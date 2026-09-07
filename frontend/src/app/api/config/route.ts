import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Lues au RUNTIME (process.env du conteneur), donc les URLs du frontend
// sont modifiables via le .env de docker compose sans reconstruire l'image.
export async function GET() {
	return NextResponse.json({
		API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
		WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3002',
	});
}