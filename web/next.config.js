// Before defining your Security Headers
// add Content Security Policy directives using a template string.
const ContentSecurityPolicy = `
  default-src 'self' www.puzzlely.io api.puzzlely.io;
  child-src puzzlely.io;
  connect-src api.puzzlely.io www.puzzlely.io api.panelbear.com;
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

module.exports = {
  // The starter code load resources from `public` folder with `router.basePath`
  // in React components. So, the source code is "basePath-ready". You can
  // remove `basePath` if you don't need it.
  basePath: "",
  output: "standalone",
  poweredByHeader: false,
  swcMinify: true,
  trailingSlash: true,
  reactStrictMode: true,

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
  rewrites: async () => {
    return [
      {
        source: "/bear.js",
        destination: "https://cdn.panelbear.com/analytics.js",
      },
    ];
  },
};
