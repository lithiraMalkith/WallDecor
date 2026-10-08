"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/cart-context";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";
import { Header } from "@/components/header";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/adminlogin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CustomerAuthProvider>
      <CartProvider>
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </CustomerAuthProvider>
  );
}
