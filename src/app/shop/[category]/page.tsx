import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ShopBrowser } from "@/components/shop-browser";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category.replaceAll("-", " ")} Wall Art`,
    description: `Handmade textured art for ${category.replaceAll("-", " ")}.`,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const label = category
    .split("-")
    .map((x) => x[0]?.toUpperCase() + x.slice(1))
    .join(" ");
  return (
    <PageShell eyebrow="Shop by room" title={label}>
      <ShopBrowser initial={label} />
    </PageShell>
  );
}
