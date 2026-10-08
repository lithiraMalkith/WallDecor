import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

const copy: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping & Delivery Policy",
    body: [
      "We deliver island-wide across all 25 districts in Sri Lanka with white-glove Cash on Delivery (COD).",
      "Production begins after phone or WhatsApp order confirmation. Each textured piece is carefully sculpted, dried, sealed, and packaged in a reinforced wooden cradle.",
      "Standard orders arrive within 5–10 working days. Free island-wide delivery is included for all orders over Rs. 10,000.",
    ],
  },
  returns: {
    title: "Returns & Craft Guarantee",
    body: [
      "Please safely inspect your package upon courier arrival before completing payment.",
      "If your textured piece shows any transit damage or frame defect, notify our studio concierge within 24 hours with photos, and we will sculpt and dispatch a complimentary replacement immediately.",
    ],
  },
  privacy: {
    title: "Privacy & Data Protection",
    body: [
      "We collect your delivery address and contact information solely to craft, dispatch, and track your artwork order.",
      "We never share, license, or sell personal customer information to third parties.",
    ],
  },
  terms: {
    title: "Terms & Craftsmanship Agreement",
    body: [
      "Each artwork is sculpted by hand with natural mineral plaster and earth pigments. Micro-variations in knife depth and natural texture are characteristic of original artisanal relief sculptures.",
      "Bespoke custom scale orders enter physical production upon quote agreement and dimension sign-off.",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: copy[slug]?.title || "Policy",
    description: "Ceylon Wall Decor customer policy.",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = copy[slug] || copy.shipping;

  return (
    <PageShell eyebrow="Client Protection" title={p.title}>
      <div className="max-w-2xl rounded-2xl border border-[#EBE8E4] bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        {p.body.map((x) => (
          <p key={x} className="text-sm sm:text-base text-[#59544F] leading-relaxed font-normal">
            {x}
          </p>
        ))}
      </div>
    </PageShell>
  );
}
