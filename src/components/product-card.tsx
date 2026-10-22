import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block border border-[#EBE8E4] hover:border-[#000000] bg-[#FFFFFF] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F3F1] elevenlabs-grain">
        {product.image && <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />}
      </div>

      <div className="p-4 flex items-baseline justify-between gap-2 border-t border-[#EBE8E4]">
        <div className="min-w-0">
          <h3 className="font-normal text-sm text-[#000000] truncate group-hover:text-[var(--store-accent-ink)] transition-colors tracking-[-0.01em]">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#777169] truncate">
            {product.style} · {product.room}
          </p>
        </div>
        <p className="text-xs font-mono text-[#000000] shrink-0">
          {product.sizes?.length ? <>From {formatPrice(product.price)}</> : "Enquire"}
        </p>
      </div>
    </Link>
  );
}
