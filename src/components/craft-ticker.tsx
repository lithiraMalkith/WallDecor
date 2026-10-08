"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll<HTMLElement>(".ticker-item");
      if (!items || items.length === 0) return;

      // Initial state: hidden with slight vertical offset
      gsap.set(items, { opacity: 0, y: 8, pointerEvents: "none" });

      const tl = gsap.timeline({ repeat: -1 });

      items.forEach((item) => {
        tl.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          pointerEvents: "auto",
        }).to(
          item,
          {
            opacity: 0,
            y: -8,
            duration: 0.5,
            ease: "power2.in",
            pointerEvents: "none",
          },
          "+=2.5" // Time gap: holds visibly for 2.5s before fading away
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative h-11 sm:h-12 border-y border-[#EBE8E4] bg-[#FFFFFF] overflow-hidden flex items-center justify-center select-none"
    >
      {TICKER_ITEMS.map((item, index) => (
        <div
          key={index}
          className="ticker-item absolute inset-0 flex items-center justify-center text-center px-4 font-mono text-[11px] sm:text-xs uppercase tracking-wider"
        >
          <span className="text-[#BA8E23] mr-2 text-sm leading-none font-sans">✦</span>
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
