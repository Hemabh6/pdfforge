import { ImageResponse } from "next/og";

export const alt = "IHavePDF – Free Online PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="2" width="18" height="20" rx="2" fill="white" opacity="0.2" />
            <rect x="3" y="2" width="18" height="20" rx="2" stroke="white" strokeWidth="1.5" />
            <path d="M7 7h10M7 11h10M7 15h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "64px", fontWeight: "800", color: "white" }}>IHavePDF</span>
        </div>
        <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.85)", margin: "0", textAlign: "center", maxWidth: "800px" }}>
          29 Free PDF Tools — Merge, Split, Convert, Sign & More
        </p>
        <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)", margin: "16px 0 0", textAlign: "center" }}>
          100% Browser-Based · No Upload · No Sign-up
        </p>
      </div>
    ),
    size
  );
}
