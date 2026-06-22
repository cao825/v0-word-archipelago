import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-config"

// Served at /sitemap.xml (Next.js Metadata Route). The app is a single-page game,
// so the only indexable route is "/". Replaces the former static app/sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ]
}
