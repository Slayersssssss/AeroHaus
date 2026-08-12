import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { builds, brands, products } from "@/lib/store";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/builds",
    "/about",
    "/contact",
    "/shipping-policy",
    "/returns",
    "/refund-policy",
    "/privacy-policy",
    "/terms",
    "/fitment-help",
    "/faq",
    "/track-order",
    "/wholesale",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const buildRoutes: MetadataRoute.Sitemap = builds.map((build) => ({
    url: `${SITE_URL}/builds/${build.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...brandRoutes, ...productRoutes, ...buildRoutes];
}
