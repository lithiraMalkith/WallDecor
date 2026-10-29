import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function ArtworkHero({ children }: { children: ReactNode }) {
  return (
    <section className="art-hero" aria-labelledby="art-hero-title">
      <div className="art-hero-intro">
        <span className="art-hero-badge">Handcrafted in Sri Lanka. Made for your home.</span>
        <h1 id="art-hero-title">A little texture.<br />A whole lot of feeling.</h1>
        <p>Turn your walls into something wonderful with<br className="hidden sm:block" /> hand-sculpted art. Natural textures, thoughtful details,<br className="hidden sm:block" /> and a little piece of Ceylon.</p>
        <span className="hero-sketch-marks" aria-hidden="true">//</span>
        <div className="hero-side-note" aria-hidden="true">
          <span>Good things<br />take shape</span>
          <svg viewBox="0 0 130 85" fill="none"><path d="M5 15C135 0 128 58 84 67m0 0 7-17m-7 17 19-1" /></svg>
        </div>
      </div>

      {children}

      <div className="art-hero-action">
        <Link href="/shop" className="art-hero-cta">Find your wall art <ArrowUpRight size={19} /></Link>
      </div>
    </section>
  );
}
