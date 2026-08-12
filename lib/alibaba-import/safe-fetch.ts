import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { isAlibabaHostname } from "@/lib/alibaba-import/url";

const PRIVATE_IPV4 = [
  /^127\./,
  /^10\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./,
];

function isPrivateIp(address: string) {
  if (address.includes(":")) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }

  return PRIVATE_IPV4.some((pattern) => pattern.test(address));
}

function isAllowedImageHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    isAlibabaHostname(host) ||
    host === "alicdn.com" ||
    host.endsWith(".alicdn.com")
  );
}

export async function assertSafeRemoteImageUrl(input: string) {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Invalid image URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Invalid image URL");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Invalid image URL");
  }

  const host = parsed.hostname.toLowerCase();
  if (!isAllowedImageHost(host) && isIP(host)) {
    throw new Error("Invalid image URL");
  }

  if (!isAllowedImageHost(host)) {
    throw new Error("Invalid image URL");
  }

  const { address } = await lookup(host, { verbatim: true });
  if (isPrivateIp(address)) {
    throw new Error("Invalid image URL");
  }

  return parsed.toString();
}

export async function fetchSafeRemoteImage(url: string) {
  const safeUrl = await assertSafeRemoteImageUrl(url);
  const response = await fetch(safeUrl, {
    redirect: "error",
    headers: {
      Accept: "image/*,*/*",
    },
  });
  if (!response.ok) {
    throw new Error("Could not download image");
  }
  return response;
}
