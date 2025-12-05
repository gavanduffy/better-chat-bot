import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const BUILD_OUTPUT = process.env.NEXT_STANDALONE_OUTPUT
  ? "standalone"
  : undefined;

export default () => {
  const nextConfig: NextConfig = {
    output: BUILD_OUTPUT,
    cleanDistDir: true,
    devIndicators: {
      position: "bottom-right",
    },
    env: {
      NO_HTTPS: process.env.NO_HTTPS,
    },
    experimental: {
      taint: true,
      authInterrupts: true,
    },
    async headers() {
      // WebContainers require Cross-Origin headers for SharedArrayBuffer support
      return [
        {
          source: "/:path*",
          headers: [
            { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ],
        },
      ];
    },
  };
  const withNextIntl = createNextIntlPlugin();
  return withNextIntl(nextConfig);
};
