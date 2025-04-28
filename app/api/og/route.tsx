import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  try {
    const interBold = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZFhjQ.woff2",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer())

    const interRegular = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZFhjQ.woff2",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer())

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #0c4a6e, #082f49)",
          fontFamily: '"Inter"',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "24px",
            padding: "40px 80px",
            background: "rgba(7, 89, 133, 0.4)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: "white",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.025em",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#fbbf24" }}>WORD</span> ISLANDS
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#7dd3fc",
              margin: "16px 0 32px",
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            Navigate islands, form words, complete objectives
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "12px 24px",
            }}
          >
            <p
              style={{
                fontSize: 24,
                color: "white",
                margin: 0,
              }}
            >
              Play the daily puzzle at word-islands.vercel.app
            </p>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: interRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: interBold,
            weight: 700,
            style: "normal",
          },
        ],
      },
    )
  } catch (e) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
