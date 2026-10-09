import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductAsync, syncProductsFromFirestore } from "@/lib/products";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const live = await syncProductsFromFirestore();
  return live.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductAsync(slug);
  return p
    ? { title: p.name, description: p.description }
    : { title: "Artwork not found" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductAsync(slug);
  if (!p) notFound();
  return <ProductDetail product={p} />;
}
