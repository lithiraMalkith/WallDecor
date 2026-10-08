import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about handmade art, delivery, framing and custom orders.",
};

const qs = [
  [
    "How long does an order take to craft?",
    "Every piece is sculpted by hand. Standard catalog designs take 5–10 working days to shape, dry, and seal. Bespoke custom commissions take 7–14 working days depending on canvas scale.",
  ],
  [
    "Do you deliver island-wide across Sri Lanka?",
    "Yes. We deliver to all 25 districts in Sri Lanka with white-glove Cash on Delivery (COD). Delivery is free on orders above Rs. 10,000.",
  ],
  [
    "Can I request a custom size or frame finish?",
    "Absolutely. Our Colombo studio creates custom wall reliefs up to 8 feet in length. You can submit your wall measurements via our Bespoke Atelier desk or WhatsApp for a quotation within 24 hours.",
  ],
  [
    "Will my artwork look identical to the catalog photo?",
    "Each piece is sculpted individually using palette knives and mineral plaster. While compositions match the curated design, micro knife ridges and light-catching textures are uniquely organic.",
  ],
  [
    "How is the textured artwork protected against humidity?",
    "Every sculpted relief is sealed with a breathable UV-resistant satin protective coat formulated specifically for tropical island humidity and ambient dust.",
  ],
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Knowledge &amp; Support"
      title="Common questions."
      intro="Everything you need to know about our crafting timeline, white-glove delivery, bespoke sizing, and plaster care."
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {qs.map(([q, a]) => (
          <details
            key={q}
            className="group rounded-2xl border border-[#EBE8E4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all open:bg-[#FAF9F7]"
          >
            <summary className="cursor-pointer text-base font-normal text-[#000000] tracking-[-0.01em] list-none flex items-center justify-between">
              <span>{q}</span>
              <span className="text-[#777169] text-xl font-light transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 pt-3 border-t border-[#EBE8E4] text-xs sm:text-sm text-[#59544F] leading-relaxed font-normal">
              {a}
            </p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
