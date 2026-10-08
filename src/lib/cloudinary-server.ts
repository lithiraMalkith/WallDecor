// ============================================================================
// Ceylon Wall Decor — Server-Side Cloudinary SDK & Upload Operations
// (Server Only — Do NOT import in client components)
// ============================================================================

import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CONFIG, getElevenLabsNoiseUrl } from "./cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtxw88le2";
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  applyNoise?: boolean;
  noiseLevel?: number;
  tags?: string[];
}

export interface UploadResult {
  url: string;
  noisyUrl: string;
  originalUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Server-side helper to upload a Buffer or base64 data URI to Cloudinary
 */
export async function uploadToCloudinary(
  fileBufferOrBase64: Buffer | string,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const folder = options.folder || CLOUDINARY_CONFIG.defaultFolder;
  const applyNoise = options.applyNoise !== false;
  const noiseLevel = options.noiseLevel || CLOUDINARY_CONFIG.defaultNoiseLevel;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        tags: ["ceylon-wall-decor", ...(options.tags || [])],
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload image to Cloudinary"));
        }

        const originalUrl = result.secure_url;
        const noisyUrl = getElevenLabsNoiseUrl(originalUrl, noiseLevel);

        resolve({
          url: applyNoise ? noisyUrl : originalUrl,
          noisyUrl,
          originalUrl,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      },
    );

    if (Buffer.isBuffer(fileBufferOrBase64)) {
      uploadStream.end(fileBufferOrBase64);
    } else if (typeof fileBufferOrBase64 === "string") {
      cloudinary.uploader
        .upload(fileBufferOrBase64, {
          folder,
          public_id: options.publicId,
          tags: ["ceylon-wall-decor", ...(options.tags || [])],
        })
        .then((result) => {
          const originalUrl = result.secure_url;
          const noisyUrl = getElevenLabsNoiseUrl(originalUrl, noiseLevel);
          resolve({
            url: applyNoise ? noisyUrl : originalUrl,
            noisyUrl,
            originalUrl,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        })
        .catch(reject);
    } else {
      reject(new Error("Unsupported input format for Cloudinary upload"));
    }
  });
}
