import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/schedule", priority: 0.9 },
    { path: "/case/kems", priority: 0.8 },
  ] as const;

  return routes.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: "2026-07-27",
    changeFrequency: "weekly" as const,
    priority,
  }));
}
