import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { OrderTracker } from "@/components/order-tracker";

export const metadata: Metadata = {
  title: "Track Your Order — Ceylon Wall Decor",
  description: "Live workshop carving progress and courier tracking for your handcrafted Ceylon Wall Decor artwork.",
};

export default function Page() {
  return (
    <PageShell
      eyebrow="Workshop Radar"
      title="Track your artwork."
      intro="Follow each artisan stage in real time — from mineral plaster sculpting and protective satin curing to white-glove island-wide delivery."
    >
      <OrderTracker />
    </PageShell>
  );
}
