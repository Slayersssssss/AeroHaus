import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchSafeRemoteImage } from "@/lib/alibaba-import/safe-fetch";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ensureProductImageBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === "product-images")) {
    await supabase.storage.createBucket("product-images", { public: true });
  }
}

function extensionFromContentType(contentType: string, fallbackPath: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("gif")) return "gif";
  const fromPath = fallbackPath.split(".").pop()?.toLowerCase();
  if (fromPath && ["png", "webp", "svg", "gif", "jpg", "jpeg"].includes(fromPath)) {
    return fromPath === "jpeg" ? "jpg" : fromPath;
  }
  return "jpg";
}

async function uploadImageBuffer(
  buffer: Buffer | ArrayBuffer,
  filePath: string,
  contentType: string
) {
  const supabase = createSupabaseAdminClient();
  const upload = await supabase.storage
    .from("product-images")
    .upload(filePath, buffer, { contentType, upsert: true });
  if (upload.error) {
    throw upload.error;
  }
  return supabase.storage.from("product-images").getPublicUrl(filePath).data.publicUrl;
}

export async function importSourceImage(url: string, pathPrefix: string) {
  if (!url) return null;

  if (url.startsWith("/assets/")) {
    const publicRoot = path.resolve(process.cwd(), "public", "assets");
    const resolved = path.resolve(process.cwd(), "public", url.replace(/^\/+/, ""));
    if (!resolved.startsWith(publicRoot + path.sep) && resolved !== publicRoot) {
      throw new Error("Invalid image path");
    }
    const buffer = await readFile(resolved);
    const extension = path.extname(resolved).replace(".", "") || "svg";
    const contentType =
      extension === "svg"
        ? "image/svg+xml"
        : extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg";
    return uploadImageBuffer(buffer, `${pathPrefix}.${extension}`, contentType);
  }

  const response = await fetchSafeRemoteImage(url);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = extensionFromContentType(contentType, url);
  const arrayBuffer = await response.arrayBuffer();
  return uploadImageBuffer(arrayBuffer, `${pathPrefix}.${extension}`, contentType);
}
