// ============================================================================
// Ceylon Wall Decor — Cloudinary Media & ElevenLabs Noise Styling Pipeline
// (Client-Safe Configuration, Seed Constants, & URL Transformation Helpers)
// ============================================================================

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtxw88le2",
  defaultFolder: "ceylon-wall-decor/products",
  defaultNoiseLevel: 20, // ElevenLabs signature film grain density
};

export const CLOUDINARY_SEED_IMAGES = {
  sunrise:
    "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451905/ceylon-wall-decor/products/sunrise.jpg",
  contour:
    "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451907/ceylon-wall-decor/products/contour.jpg",
  botanica:
    "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451907/ceylon-wall-decor/products/botanica.jpg",
  hero:
    "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg",
} as const;

/**
 * Transforms a Cloudinary URL to include the ElevenLabs tactile analog noise filter
 * along with auto-format and auto-quality delivery optimization.
 */
export function getElevenLabsNoiseUrl(
  url: string,
  noiseLevel: number = CLOUDINARY_CONFIG.defaultNoiseLevel,
): string {
  if (!url || typeof url !== "string") return url;

  // If not a Cloudinary asset, return as-is
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  // If already contains e_noise transformation, replace or return
  if (url.includes("e_noise:")) {
    return url.replace(/e_noise:\d+/, `e_noise:${noiseLevel}`);
  }

  // Inject transformation right after /upload/
  const uploadMarker = "/upload/";
  const uploadIdx = url.indexOf(uploadMarker);

  if (uploadIdx === -1) {
    return url;
  }

  const prefix = url.slice(0, uploadIdx + uploadMarker.length);
  const suffix = url.slice(uploadIdx + uploadMarker.length);
  const transformation = `e_noise:${noiseLevel},q_auto,f_auto/`;

  return `${prefix}${transformation}${suffix}`;
}
