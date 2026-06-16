import { put } from "@vercel/blob";

/**
 * Persists an uploaded image and returns a URL to it.
 *
 * If a Vercel Blob token is configured (`BLOB_READ_WRITE_TOKEN`), the image is
 * offloaded to Blob object storage and a short CDN URL is returned. Otherwise
 * it gracefully falls back to keeping the original base64 data URL, so the app
 * works with zero configuration locally and upgrades automatically on Vercel.
 *
 * Accepts either a `data:image/...;base64,...` string or an existing URL
 * (which is returned unchanged).
 */
export async function storeImage(
  value: string | null | undefined,
  prefix: string
): Promise<string | null> {
  if (!value) return value ?? null;
  if (!value.startsWith("data:")) return value; // already a URL
  if (!process.env.BLOB_READ_WRITE_TOKEN) return value; // fallback: keep data URL

  const match = value.match(/^data:(image\/(png|jpe?g));base64,(.+)$/);
  if (!match) return value;

  const contentType = match[1];
  const ext = contentType === "image/png" ? "png" : "jpg";
  const buffer = Buffer.from(match[3], "base64");

  const { url } = await put(`${prefix}-${Date.now()}.${ext}`, buffer, {
    access: "public",
    contentType,
  });
  return url;
}
