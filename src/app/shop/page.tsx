import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ShopBrowser } from "@/components/shop-browser";
import { syncProductsFromFirestore } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop Textured Wall Art",
  description: "Browse handmade textured wall art by room and style.",
};

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; room?: string }>;
}) {
  const params = await searchParams;
  const initialSearch = params?.search || "";
  const initialRoom = params?.room || "All";
  const liveProducts = await syncProductsFromFirestore();

  return (
    <PageShell
      eyebrow="The collection"
      title="Art with Depth."
      intro="Each design is shaped by hand and made to order in Sri Lanka."
    >
      <ShopBrowser
        initialProducts={liveProducts}
        initialQuery={initialSearch}
        initialRoom={initialRoom}
      />
    </PageShell>
  );
}
