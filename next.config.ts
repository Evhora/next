import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/config.ts");

export default withNextIntl(nextConfig);
