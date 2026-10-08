import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";

import { CLOUDINARY_SEED_IMAGES } from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "Customer Gallery",
  description: "See Ceylon Wall Decor textured artworks in real rooms.",
};

const imgs = [
  CLOUDINARY_SEED_IMAGES.hero,
  CLOUDINARY_SEED_IMAGES.sunrise,
  CLOUDINARY_SEED_IMAGES.botanica,
  CLOUDINARY_SEED_IMAGES.contour,
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Real Homes &amp; Spaces"
      title="On the wall."
      intro="Collector photography featuring sculpted plaster reliefs in contemporary Sri Lankan living rooms, bedrooms, and dining spaces."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {imgs.map((s, i) => (
          <div
            key={s}
            className={`relative rounded-2xl overflow-hidden border border-[#EBE8E4] bg-[#F5F3F1] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group elevenlabs-grain ${
              i === 0 ? "col-span-2 aspect-[16/10] md:col-span-2" : "aspect-[4/5]"
            }`}
          >
            <Image
              src={s}
              alt="Ceylon Wall Decor artwork in a customer room"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
