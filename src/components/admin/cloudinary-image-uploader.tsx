"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { getElevenLabsNoiseUrl } from "@/lib/cloudinary";

interface CloudinaryImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function CloudinaryImageUploader({
  value,
  onChange,
  label = "Artwork Image",
  description,
}: CloudinaryImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [applyNoise, setApplyNoise] = useState(true);
  const [noiseLevel, setNoiseLevel] = useState(20);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applyNoise", String(applyNoise));
      formData.append("noiseLevel", String(noiseLevel));
      formData.append("folder", "ceylon-wall-decor/products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      onChange(data.data.url);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setUploadError(err.message || "Upload failed. Please check connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleNoiseToggle = (enabled: boolean) => {
    setApplyNoise(enabled);
    if (!value) return;

    if (value.includes("res.cloudinary.com")) {
      if (enabled) {
        const noisy = getElevenLabsNoiseUrl(value, noiseLevel);
        onChange(noisy);
      } else {
        const clean = value.replace(/e_noise:\d+,?/, "").replace(/upload\/,\//, "upload/");
        onChange(clean);
      }
    }
  };

  const handleNoiseLevelChange = (level: number) => {
    setNoiseLevel(level);
    if (value && value.includes("res.cloudinary.com")) {
      const updated = getElevenLabsNoiseUrl(value, level);
      onChange(updated);
    }
  };

  const isCloudinary = value?.includes("res.cloudinary.com");
  const hasNoiseFilter = value?.includes("e_noise:");

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#000000]">
            {label}
          </label>
          {description && (
            <p className="text-[12px] text-[#777169] mt-0.5">{description}</p>
          )}
        </div>
        {isCloudinary && (
          <span className="text-[11px] text-[#777169] font-mono">
            Cloudinary CDN {hasNoiseFilter ? "· 11Labs Grain" : ""}
          </span>
        )}
      </div>

      {/* Main Row: Thumbnail + Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview Container with Drag & Drop */}
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border cursor-pointer transition-all shrink-0 bg-[#F5F3F1] elevenlabs-grain ${
            dragActive
              ? "border-[#000000] ring-1 ring-[#000000]"
              : "border-[#EBE8E4] hover:border-[#000000]"
          }`}
          title="Click or drag an image here to upload"
        >
          {value ? (
            <Image
              src={value}
              alt="Artwork preview"
              fill
              className="object-cover"
              unoptimized={!isCloudinary}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 text-xs text-[#777169]">
              <span>Click or drag image</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-normal">
              Uploading...
            </div>
          )}
        </div>

        {/* Input & Options */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          {/* Upload Button */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 px-4 rounded-full bg-[#000000] text-white hover:bg-[#222222] text-xs font-normal transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? "Uploading..." : "Upload New File"}
            </button>
            <span className="text-[11px] text-[#777169]">
              or drag & drop onto preview
            </span>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full h-9 px-3 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] font-mono placeholder:text-[#A09A92] transition-colors"
            />
          </div>

          {/* Film Grain Options Segmented Control */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[11px] text-[#777169] uppercase tracking-[0.05em]">
              11Labs Film Grain:
            </span>
            <div className="inline-flex rounded-lg border border-[#EBE8E4] p-0.5 bg-[#F5F3F1]">
              <button
                type="button"
                onClick={() => handleNoiseToggle(false)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  !applyNoise || !hasNoiseFilter
                    ? "bg-white text-[#000000] font-medium shadow-xs"
                    : "text-[#777169] hover:text-[#000000]"
                }`}
              >
                Off
              </button>
              {[
                { label: "Subtle (15)", level: 15 },
                { label: "Standard (20)", level: 20 },
                { label: "Deep (30)", level: 30 },
              ].map((p) => {
                const active =
                  applyNoise && hasNoiseFilter && (noiseLevel === p.level || value?.includes(`e_noise:${p.level}`));
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => {
                      handleNoiseToggle(true);
                      handleNoiseLevelChange(p.level);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      active
                        ? "bg-white text-[#000000] font-medium shadow-xs"
                        : "text-[#777169] hover:text-[#000000]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {uploadError && (
            <p className="text-xs text-red-600 mt-1">{uploadError}</p>
          )}
        </div>
      </div>


    </div>
  );
}
