export const SITE_NAME = "AEROHAUS";
export const SITE_TAGLINE = "European Automotive Styling";
export const SITE_DESCRIPTION =
  "Premium aero, carbon fiber, wheels, lighting and performance styling upgrades for European performance vehicles.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aerohaus.example";
export const ACCENT_COLOR = "#D7FF39";

export const announcementMessage =
  "FREE SHIPPING ON SELECT U.S. ORDERS | FITMENT SUPPORT AVAILABLE";

export const navigationLinks = [
  { label: "Shop", href: "/shop" },
  { label: "BMW", href: "/bmw" },
  { label: "Mercedes-Benz", href: "/mercedes-benz" },
  { label: "Audi", href: "/audi" },
  { label: "Porsche", href: "/porsche" },
  { label: "New Arrivals", href: "/shop?badge=new" },
  { label: "Best Sellers", href: "/shop?badge=best-seller" },
  { label: "Fitment Help", href: "/fitment-help" },
] as const;

export const footerDisclaimer =
  "AeroHaus is an independent aftermarket parts retailer and is not affiliated with, endorsed by, or sponsored by BMW, Mercedes-Benz, Audi, Porsche, or their respective parent companies. All manufacturer names, model names, trademarks and logos are used solely for identification and fitment purposes.";
