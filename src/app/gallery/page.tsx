import { getStorefrontMedia } from "@/lib/storefront-media-server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Room Gallery",
  description: "Explore sage-toned interiors and handcrafted wall-art inspiration from Ceylon Wall Decor.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const scenes = (await getStorefrontMedia()).filter(scene => scene.galleryOrder !== undefined).sort((a,b) => a.galleryOrder! - b.galleryOrder!);
  return (
    <PageShell
      eyebrow="Spaces & textures"
      title="Art, at home."
      intro="A little inspiration for quieter, greener spaces. Natural textures, soft sage tones, and art that makes a room feel like yours."
    >
      <div className="gallery-grid">
        {scenes.map((scene, index) => (
          <figure key={scene.image} className={`gallery-piece ${scene.wide ? "gallery-piece-wide" : ""} ${index === scenes.length - 1 ? "gallery-piece-last" : ""}`}>
            <div className="gallery-media elevenlabs-grain">
              <Image src={scene.image} alt={scene.alt} fill sizes={scene.wide ? "(max-width: 767px) calc(100vw - 40px), 66vw" : "(max-width: 767px) calc(50vw - 28px), 33vw"} loading={index === 0 ? "eager" : "lazy"} className="object-cover" />
            </div>
            <figcaption><span>{scene.title}</span><span>{scene.detail}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-endnote">
        <p>AI-generated room studies to help you imagine the collection in your space.</p>
        <Link href="/custom-order" className="btn btn-accent">Create something for your space</Link>
      </div>
    </PageShell>
  );
}
