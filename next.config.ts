import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

export default withNextIntl(nextConfig);
