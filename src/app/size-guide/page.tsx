import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Wall Art Size Guide",
  description: "Choose the right artwork size for your wall.",
};

const sizes = [
  ["6 × 6", "Compact accent shelf", "Rs. 3,500"],
  ["8 × 8", "Bedside or console nook", "Rs. 4,200"],
  ["12 × 16", "Single focal wall feature", "Rs. 6,800"],
  ["16 × 20", "Living room sofa centerpiece", "Rs. 9,500"],
  ["20 × 24", "Executive dining statement", "Rs. 13,500"],
  ["Bespoke (up to 8ft)", "Double-height architectural walls", "Custom quote"],
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Architectural Proportions"
      title="Find your scale."
      intro="Use painter’s tape to outline dimensions on your wall before ordering. We recommend leaving at least 15–20cm of wall clearance around the frame."
    >
      <div className="grid gap-10 lg:grid-cols-2 items-start">
        {/* Scale preview container */}
        <div className="rounded-2xl border border-[#EBE8E4] bg-[#F5F3F1] p-10 flex flex-col items-center justify-center min-h-[360px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="relative aspect-[4/5] w-48 rounded-lg bg-white border-4 border-black shadow-lg grid place-items-center">
            <span className="font-mono text-xs text-[#000000] font-medium">16 × 20 in</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
          </div>
          {/* Furniture line indicator */}
          <div className="mt-8 h-2.5 w-64 rounded-full bg-black/20" />
          <p className="mt-3 text-[11px] font-mono uppercase text-[#777169] tracking-wider">
            Typical 3-Seater Sofa / Console Proportion
          </p>
        </div>

        {/* Sizes list card */}
        <div className="rounded-2xl border border-[#EBE8E4] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] divide-y divide-[#EBE8E4]">
          {sizes.map(([s, n, p]) => (
            <div key={s} className="py-4 flex items-center justify-between gap-4">
              <div>
                <b className="font-mono text-sm text-[#000000]">{s} in</b>
                <p className="text-xs text-[#59544F] mt-0.5">{n}</p>
              </div>
              <span className="font-mono text-xs text-[#777169]">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
