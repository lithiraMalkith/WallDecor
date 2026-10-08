import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CartPage } from "@/components/cart-page";
export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your wall art selection.",
};
export default function Page() {
  return (
    <PageShell eyebrow="Your selection" title="Cart">
      <CartPage />
    </PageShell>
  );
}
