import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary-server";
import { CLOUDINARY_CONFIG } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    );

    if (!isConfigured) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary credentials are missing. Please verify NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
        { status: 500 },
      );
    }

    let fileBuffer: Buffer | null = null;
    let base64String: string | null = null;
    let applyNoise = true;
    let noiseLevel = CLOUDINARY_CONFIG.defaultNoiseLevel;
    let folder = CLOUDINARY_CONFIG.defaultFolder;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided in form data" },
          { status: 400 },
        );
      }

      if (formData.has("applyNoise")) {
        applyNoise = formData.get("applyNoise") === "true";
      }

      if (formData.has("noiseLevel")) {
        const parsed = Number(formData.get("noiseLevel"));
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          noiseLevel = parsed;
        }
      }

      if (formData.has("folder")) {
        folder = String(formData.get("folder"));
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      if (!json.file && !json.dataUrl) {
        return NextResponse.json(
          { success: false, error: "Missing 'file' or 'dataUrl' in JSON payload" },
          { status: 400 },
        );
      }

      base64String = json.dataUrl || json.file;
      if (typeof json.applyNoise === "boolean") {
        applyNoise = json.applyNoise;
      }
      if (typeof json.noiseLevel === "number") {
        noiseLevel = json.noiseLevel;
      }
      if (json.folder) {
        folder = json.folder;
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type. Send multipart/form-data or application/json." },
        { status: 400 },
      );
    }

    const payload = fileBuffer || base64String;
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Could not read file payload" },
        { status: 400 },
      );
    }

    const result = await uploadToCloudinary(payload, {
      folder,
      applyNoise,
      noiseLevel,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        noisyUrl: result.noisyUrl,
        originalUrl: result.originalUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  } catch (error: any) {
    console.error("POST /api/upload Cloudinary error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to upload image to Cloudinary",
      },
      { status: 500 },
    );
  }
}
