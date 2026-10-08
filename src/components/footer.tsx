import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#000000] text-[#FFFFFF] border-t border-white/10">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="text-xl font-normal tracking-tight uppercase text-white hover:text-[#BA8E23] transition-colors"
            >
              Wall <span className="text-[#BA8E23]">/</span> Decor
            </Link>
            <p className="max-w-sm text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
              Small-batch textured relief art, hand-sculpted in Sri Lanka with mineral plaster
              and earth pigments for modern residences and boutique hospitality.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#BA8E23]">
              {/* <span className="size-2 rounded-full bg-[#BA8E23]" /> */}
              <span>Studio Workshop in Colombo, Sri Lanka</span>
            </div>
          </div>

          {/* Collection Column */}
          <div className="lg:col-span-2 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#BA8E23]">
              Collection
            </p>
            <ul className="space-y-2.5 text-xs text-white/70 font-normal">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Artworks
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Living+Room" className="hover:text-white transition-colors">
                  Living Room Relieves
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Bedroom" className="hover:text-white transition-colors">
                  Bedroom Minimal
                </Link>
              </li>
              <li>
                <Link href="/shop?room=Dining" className="hover:text-white transition-colors">
                  Dining Statement Pieces
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Texture Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Bespoke Atelier Column */}
          <div className="lg:col-span-2 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#BA8E23]">
              Bespoke Atelier
            </p>
            <ul className="space-y-2.5 text-xs text-white/70 font-normal">
              <li>
                <Link href="/custom-order" className="hover:text-white transition-colors">
                  Custom Sizing Desk
                </Link>
              </li>
              <li>
                <Link href="/order/track" className="hover:text-white transition-colors">
                  Track COD Order
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  Dimensions Guide
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Delivery &amp; Packaging
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Support Column */}
          <div className="lg:col-span-3 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#BA8E23]">
              Concierge
            </p>
            <ul className="space-y-2.5 text-xs text-white/70 font-normal">
              <li>
                <a
                  href="https://wa.me/94782518184"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#BA8E23] transition-colors flex items-center gap-1"
                >
                  WhatsApp · 078 251 8184
                  <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Send Direct Inquiry
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/adminlogin" className="text-white/40 hover:text-white transition-colors">
                  Studio Staff Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono uppercase text-white/40 gap-4">
          <span>© 2026 Wall / Decor · Sri Lanka</span>
          <div className="flex gap-6">
            <Link href="/policies/terms" className="hover:text-white">
              Terms &amp; Craft Guarantee
            </Link>
            <Link href="/policies/privacy" className="hover:text-white">
              Privacy
            </Link>
            <span>Island-wide White-Glove COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
