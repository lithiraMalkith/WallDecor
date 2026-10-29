"use client";


const TICKER_ITEMS = [
  {
    title: "100% Hand-Sculpted in Sri Lanka",
    subtitle: "Natural mineral plaster & earth pigments",
  },
  {
    title: "Island-Wide Cash on Delivery (COD)",
    subtitle: "5–10 day artisan crafting lead time",
  },
  {
    title: "Bespoke Architectural Dimensions",
    subtitle: "Custom sizing up to 8 feet with 24h quote",
  },
];

export function CraftTicker() {
  return (
    <div
      className="relative h-11 sm:h-12 border-y border-[#EBE8E4] bg-[#FFFFFF] overflow-hidden flex items-center justify-center select-none"
    >
      {TICKER_ITEMS.map((item, index) => (
        <div
          key={index}
          style={{ animationDelay: `${index * 3.6}s` }}
          className="ticker-item absolute inset-0 flex items-center justify-center text-center px-4 font-mono text-[11px] sm:text-xs uppercase tracking-wider"
        >
          <span className="text-[var(--store-accent-ink)] mr-2 text-sm leading-none font-sans">✦</span>
          <span className="text-[#000000] font-medium tracking-tight sm:tracking-normal">
            {item.title}
          </span>
          <span className="text-[#777169] ml-2 hidden sm:inline">
            · {item.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
