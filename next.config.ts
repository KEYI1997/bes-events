import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // PDFKit loads its built-in AFM metrics through fs at runtime. Keep these
  // files in the serverless function bundle; otherwise production PDF output
  // fails with ENOENT for Helvetica.afm.
  outputFileTracingIncludes: {
    '/*': ['./node_modules/pdfkit/js/data/**/*'],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
