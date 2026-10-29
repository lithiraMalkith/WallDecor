import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadToCloudinary } from '@/lib/cloudinary-server';
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary';
import { imageFileError, MAX_IMAGE_BYTES } from '@/lib/image-upload';

export const runtime = 'nodejs';
export const maxDuration = 60;
const badRequest = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let mime: string;
    let applyNoise = true;
    let noiseLevel = CLOUDINARY_CONFIG.defaultNoiseLevel;
    let folder = CLOUDINARY_CONFIG.defaultFolder;

    if (contentType.includes('multipart/form-data')) {
      const data = await req.formData();
      const file = data.get('file');
      if (!(file instanceof File)) return badRequest('Choose an image to upload.');
      const error = imageFileError(file);
      if (error) return badRequest(error, file.size > MAX_IMAGE_BYTES ? 413 : 400);
      buffer = Buffer.from(await file.arrayBuffer());
      mime = file.type;
      applyNoise = data.get('applyNoise') !== 'false';
      noiseLevel = Number(data.get('noiseLevel') ?? noiseLevel);
      folder = String(data.get('folder') || folder);
    } else if (contentType.includes('application/json')) {
      const data = await req.json();
      const value = data.dataUrl || data.file;
      if (typeof value !== 'string') return badRequest('Choose an image to upload.');
      if (value.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 100) return badRequest('Each image must be 10MB or smaller.', 413);
      const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
      if (!match) return badRequest('Choose a JPG, PNG, or WEBP image.');
      mime = match[1];
      buffer = Buffer.from(match[2], 'base64');
      const error = imageFileError({ type: mime, size: buffer.length });
      if (error) return badRequest(error, buffer.length > MAX_IMAGE_BYTES ? 413 : 400);
      applyNoise = data.applyNoise !== false;
      noiseLevel = data.noiseLevel ?? noiseLevel;
      folder = data.folder || folder;
    } else {
      return badRequest('Send an image as multipart/form-data or a base64 data URL.', 415);
    }

    if (typeof folder !== 'string' || !/^ceylon-wall-decor\/[a-z0-9/_-]+$/i.test(folder)) return badRequest('Invalid upload folder.');
    if (!Number.isFinite(noiseLevel) || noiseLevel < 0 || noiseLevel > 100) return badRequest('Grain level must be between 0 and 100.');
    try {
      const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
      const format = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
      if (!metadata.width || !metadata.height || metadata.format !== format) return badRequest('This file is not a valid JPG, PNG, or WEBP image.');
    } catch { return badRequest('This image could not be read. Please choose another JPG, PNG, or WEBP file.'); }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return badRequest('Image uploads are temporarily unavailable. Please try again later.', 503);
    }
    const result = await uploadToCloudinary(buffer, { folder, applyNoise, noiseLevel });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Image upload failed:', error instanceof Error ? error.message : 'Upload provider error');
    return badRequest('The image could not be uploaded. Please check your connection and try again.', 502);
  }
}
