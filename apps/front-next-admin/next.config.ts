import type { NextConfig } from "next";
import { basePath } from "./env";

const bofansApiBaseUrl =
  process.env.BOFANS_API_BASE_URL || "http://localhost:3000/bofans";

const nextConfig: NextConfig = {
  /* config options here */
  basePath,
  rewrites: async () => {
    return [
      // {
      //   source: "/api/:path*",
      //   destination: "http://localhost:3000/bofans/:path*",
      // },
      {
        source: "/api/:path*",
        destination: `${bofansApiBaseUrl}/:path*`,
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/bofans_admin/review",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
