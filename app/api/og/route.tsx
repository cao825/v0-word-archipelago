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
        {/* Title and branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
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
            <span style={{ color: "#fbbf24" }}>WORD</span> ISLES
          </h1>
        </div>

        {/* Islands with letters */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Island with W */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60%",
              background: "linear-gradient(to bottom, #15803d, #166534)",
              border: "3px solid #86efac",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
          >
            {/* Sand effect */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "80%",
                height: "30%",
                borderRadius: "50%",
                background: "#fde68a",
                zIndex: 1,
              }}
            />
            <span
              style={{
                fontSize: 72,
                fontWeight: "bold",
                color: "white",
                position: "relative",
                zIndex: 2,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              W
            </span>
          </div>

          {/* Island with O */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60%",
              background: "linear-gradient(to bottom, #1d4ed8, #1e40af)",
              border: "3px solid #93c5fd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
          >
            {/* Sand effect */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "80%",
                height: "30%",
                borderRadius: "50%",
                background: "#fde68a",
                zIndex: 1,
              }}
            />
            <span
              style={{
                fontSize: 72,
                fontWeight: "bold",
                color: "white",
                position: "relative",
                zIndex: 2,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              O
            </span>
          </div>

          {/* Island with R */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60%",
              background: "linear-gradient(to bottom, #b91c1c, #991b1b)",
              border: "3px solid #fca5a5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
          >
            {/* Sand effect */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "80%",
                height: "30%",
                borderRadius: "50%",
                background: "#fde68a",
                zIndex: 1,
              }}
            />
            <span
              style={{
                fontSize: 72,
                fontWeight: "bold",
                color: "white",
                position: "relative",
                zIndex: 2,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              R
            </span>
          </div>

          {/* Island with D */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60%",
              background: "linear-gradient(to bottom, #7c2d12, #9a3412)",
              border: "3px solid #fdba74",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
          >
            {/* Sand effect */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "80%",
                height: "30%",
                borderRadius: "50%",
                background: "#fde68a",
                zIndex: 1,
              }}
            />
            <span
              style={{
                fontSize: 72,
                fontWeight: "bold",
                color: "white",
                position: "relative",
                zIndex: 2,
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              D
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 32,
            color: "#7dd3fc",
            margin: "0 0 32px",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          Navigate isles, form words, complete objectives
        </p>

        {/* Call to action */}
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
            Play the daily puzzle at word-isles.vercel.app
          </p>
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
