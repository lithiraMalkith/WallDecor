import { Home } from "@/components/home";
import { syncProductsFromFirestore } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Page() {
  const liveProducts = await syncProductsFromFirestore();
  return <Home initialProducts={liveProducts} />;
}
