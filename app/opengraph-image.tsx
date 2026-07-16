import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Revenue Operations Command Center";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 85% 10%, rgba(41,211,232,.25), transparent 340px), linear-gradient(135deg, #071321, #0b1828)",
          color: "#f8fafc",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#67e8f9",
          }}
        >
          RevOps Portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 980,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            Revenue Operations & CRM Command Center
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 28,
              lineHeight: 1.45,
              color: "#b8c7d9",
            }}
          >
            CRM architecture, automation, analytics and commercial intelligence
            transformed into one interactive decision system.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#9fb0c5",
          }}
        >
          <span>Yasser Ramirez</span>
          <span>Next.js · TypeScript · Python · RevOps</span>
        </div>
      </div>
    ),
    size,
  );
}
