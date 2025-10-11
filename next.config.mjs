/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators:
    false |
    {
      position: "top-right" // top-right, bottom-right, top-left, bottom-left
    }
};

export default nextConfig;
