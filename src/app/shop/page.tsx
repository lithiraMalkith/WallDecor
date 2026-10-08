import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ShopBrowser } from "@/components/shop-browser";
export const metadata: Metadata = {
  title: "Shop Textured Wall Art",
  description: "Browse handmade textured wall art by room and style.",
};
export default function Page() {
  return (
    <PageShell
      eyebrow="The collection"
      title="Art with Depth."
      intro="Each design is shaped by hand and made to order in Sri Lanka."
    >
      <ShopBrowser />
    </PageShell>
  );
}
