import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CheckoutForm } from "@/components/checkout-form";
export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Cash on Delivery order.",
};
export default function Page() {
  return (
    <PageShell eyebrow="Cash on delivery" title="Checkout">
      <CheckoutForm />
    </PageShell>
  );
}
