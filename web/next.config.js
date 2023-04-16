// Before defining your Security Headers
// add Content Security Policy directives using a template string.
const ContentSecurityPolicy = `
  default-src 'self' www.puzzlely.io api.puzzlely.io;
  child-src puzzlely.io;
  connect-src api.puzzlely.io www.puzzlely.io vitals.vercel-insights.com;
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  font-src 'self';
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-PROTECTION",
    value: "1; mode=block",
  },
];

/** @type {import('next').NextConfig} */
module.exports = {
  // The starter code load resources from `public` folder with `router.basePath`
  // in React components. So, the source code is "basePath-ready". You can
  // remove `basePath` if you don't need it.
  basePath: "",
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,

  headers: async () => {
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
