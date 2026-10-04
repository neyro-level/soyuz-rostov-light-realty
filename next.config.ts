import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./src/project/image-loader.ts",
  },
};

export default nextConfig;
