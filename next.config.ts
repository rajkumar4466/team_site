import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: 'export' removed — Phase 4 requires POST Route Handlers for comment submission
  // and server-side HuggingFace API calls. The existing pages still use generateStaticParams
  // and will be statically optimized by Next.js automatically.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
