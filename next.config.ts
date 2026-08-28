import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /*
      Зургийн чанар.
      Next 16-д зөвшөөрөгдсөн quality утгуудыг ЖАГСААХ шаардлагатай.
      90 нь баннер, hero зэрэг том зурагт — 75 нь картанд хангалттай.
    */
    qualities: [75, 90],

    // Барааны зургийг Cloudinary дээр хадгална
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" }, // туршилтын зураг
      { protocol: "https", hostname: "*.fbcdn.net" }, // Facebook CDN-ийн бүх subdomain-ийг зөвшөөрнө
    ],
  },
};

export default nextConfig;
