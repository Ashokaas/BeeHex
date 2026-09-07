import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false
	/*output: 'export',
	eslint: {
		dirs: ['src', 'app', 'pages', 'components', 'lib', 'utils', 'hooks', 'styles'],
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	}*/
};
export default nextConfig;