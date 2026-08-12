const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

function isIpHostname(hostname: string) {
  return (
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
    hostname.includes(":") ||
    hostname.startsWith("[")
  );
}

export function isAlibabaHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === "alibaba.com" || host.endsWith(".alibaba.com");
}

export function validateAlibabaUrl(input: string) {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error("Please enter a valid Alibaba supplier or catalog URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP or HTTPS Alibaba URLs are allowed.");
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || isIpHostname(host) || !isAlibabaHostname(host)) {
    throw new Error("Only Alibaba supplier or catalog domains are allowed.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Only Alibaba supplier or catalog domains are allowed.");
  }

  return parsed.toString();
}
