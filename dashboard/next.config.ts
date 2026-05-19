import type { NextConfig } from "next";

// basePath 는 외부 노출 시 reverse proxy 가 /console/* 로 마운트하는 경우만 의미 있음.
// 로컬에서 직접 띄울 때 (사용자가 자기 머신에서 git clone 후 bun run dev) 는 basePath 없음.
// 환경변수 BASE_PATH 가 있을 때만 적용 — operator 가 외부 노출 시 명시.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  // 좌측 하단 dev indicator (N 마크) 끄기 — 시연·스크린샷 깔끔하게
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
