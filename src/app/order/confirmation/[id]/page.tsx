import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/order-confirmation";
export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your Ceylon Wall Decor order was received.",
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderConfirmation id={id} />;
}
