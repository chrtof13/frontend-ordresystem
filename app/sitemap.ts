import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ordrebase.no",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://ordrebase.no/login",
      lastModified: new Date(),
    },
    {
      url: "https://ordrebase.no/register",
      lastModified: new Date(),
    }
  ];
}