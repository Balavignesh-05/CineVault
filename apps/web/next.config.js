/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  webpack: (config) => {
    if (process.platform !== 'win32') return config;

    /**
     * ROOT CAUSE OF "invariant expected layout router to be mounted":
     *
     * pnpm on Windows resolves symlinks to physical paths that can have
     * mixed drive-letter case (D:\ vs d:\).  Webpack builds each module's
     * unique identifier from createData.REQUEST — the full "loaderPath!...!resourcePath"
     * string.  Two modules whose request strings differ ONLY in drive-letter
     * case are treated as DISTINCT modules, so Next.js's layout-router.js (and
     * several other internals) get bundled TWICE.  Each copy calls
     * React.createContext() independently, producing two different context
     * objects.  LayoutRouter (copy A) provides LayoutRouterContext_A, but
     * OuterLayoutRouter (copy B) reads LayoutRouterContext_B — which was never
     * provided — and gets null → throws the invariant error.
     *
     * FIX: In the afterResolve hook, normalise EVERY Windows path in
     * createData.request (not just resource) to use an uppercase drive letter.
     * This makes the identifiers for the two "copies" identical, so webpack's
     * addModule() deduplicates them down to one module instance.
     */
    const normalizePaths = (str) => {
      if (typeof str !== 'string') return str;
      // Uppercase any single lowercase drive letter followed by :\
      return str.replace(/([a-z]):\\/g, (_, l) => `${l.toUpperCase()}:\\`);
    };

    config.plugins.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap(
          'WindowsPathDeduplicator',
          (factory) => {
            factory.hooks.afterResolve.tap(
              'WindowsPathDeduplicator',
              (resolveData) => {
                const cd = resolveData?.createData;
                if (!cd) return;

                // request  ← the string webpack uses in identifier() → MUST be normalised
                if (cd.request)     cd.request     = normalizePaths(cd.request);
                // Also normalise the other path fields for consistency
                if (cd.resource)    cd.resource    = normalizePaths(cd.resource);
                if (cd.userRequest) cd.userRequest = normalizePaths(cd.userRequest);
                if (cd.rawRequest)  cd.rawRequest  = normalizePaths(cd.rawRequest);
                if (cd.context)     cd.context     = normalizePaths(cd.context);

                // Normalise each loader's path too (they appear in the request string)
                if (Array.isArray(cd.loaders)) {
                  for (const loader of cd.loaders) {
                    if (loader.loader)  loader.loader  = normalizePaths(loader.loader);
                    if (loader.options) loader.options = normalizePaths(loader.options);
                  }
                }
              }
            );

            // Also catch the resolve context (issuer path) before resolution
            factory.hooks.beforeResolve.tap(
              'WindowsPathDeduplicator',
              (resolveData) => {
                if (resolveData?.context) {
                  resolveData.context = normalizePaths(resolveData.context);
                }
              }
            );
          }
        );
      },
    });

    return config;
  },
};

module.exports = nextConfig;
