/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	output: 'export',
	eslint: {
		dirs: ['src', 'app', 'pages', 'components', 'lib', 'utils', 'hooks', 'styles'],
		ignoreDuringBuilds: true
	},
	typescript: {
		ignoreBuildErrors: true
	},
	distDir: 'output',
	experimental: {
    	missingSuspenseWithCSRBailout: false,
  	}
};
export default nextConfig;
