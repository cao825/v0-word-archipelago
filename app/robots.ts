import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-config"

// Served at /robots.txt (Next.js Metadata Route). Allow all crawlers; point at the
// sitemap on the canonical origin. Replaces the former static app/robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
