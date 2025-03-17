import type { NextConfig } from "next";
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

const nextConfig: NextConfig = {
    experimental: {
        viewTransition: true,
    },
    images: {
        domains: ['qdpxznrqyzyebbrmqvpi.supabase.co'],
    },
    plugins: [new PrismaPlugin()],
};

export default nextConfig;
