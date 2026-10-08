import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CustomOrderForm } from "@/components/custom-order-form";
export const metadata: Metadata = {
  title: "Custom Wall Art",
  description: "Send your own idea for a handmade custom textured artwork.",
};
export default function Page() {
  return (
    <PageShell
      eyebrow="One of one"
      title="Your idea. Our hands."
      intro="Send a photo or sketch, choose a size and tell us about your room. We’ll quote within 24 hours."
    >
      <CustomOrderForm />
    </PageShell>
  );
}
