import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import type { Product } from "@/lib/types";

export function createMetadata(overrides?: Metadata): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} | European Automotive Styling`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | European Automotive Styling`,
      description: SITE_DESCRIPTION,
      images: [`${SITE_URL}/assets/og-default.svg`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | European Automotive Styling`,
      description: SITE_DESCRIPTION,
      images: [`${SITE_URL}/assets/og-default.svg`],
    },
    ...overrides,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    slogan: "European Automotive Styling",
    sameAs: [
      "https://instagram.com/aerohaus",
      "https://tiktok.com/@aerohaus",
      "https://youtube.com/@aerohaus",
    ],
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: product.brandName,
    name: product.title,
    description: product.shortDescription,
    image: product.gallery.map((image) => `${SITE_URL}${image}`),
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.status === "Out of Stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function breadcrumbsJsonLd(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: `${SITE_URL}${entry.item}`,
    })),
  };
}
