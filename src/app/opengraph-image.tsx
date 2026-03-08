import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TOEIC Master | 無料TOEIC対策サイト";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f3460 0%, #16537e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            TOEIC Master
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            無料でTOEIC対策！文法・語彙・リスニング
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["📝 模擬問題", "📚 単語帳", "🎧 リスニング", "📊 学習記録"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "22px",
                    color: "white",
                  }}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "20px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          toeic-master.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
