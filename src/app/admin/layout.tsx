"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Palette,
  Users,
  FolderTree,
  Truck,
  FileText,
  Tag,
  Star,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { AdminNotifications } from "./AdminNotifications";
import { ROLE_LABELS, type Permission } from "@/lib/permissions";
import type { BuiltInRole } from "@/types";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: "dashboard:read",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    permission: "products:read",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    permission: "orders:read",
  },
  {
    label: "Custom Requests",
    href: "/admin/custom-requests",
    icon: Palette,
    permission: "custom_requests:read",
  },
  {
    label: "Messages & Inquiries",
    href: "/admin/messages",
    icon: MessageSquare,
    permission: "messages:read",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    permission: "customers:read",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    permission: "categories:read",
  },
  {
    label: "Delivery & COD",
    href: "/admin/delivery",
    icon: Truck,
    permission: "delivery:read",
  },
  {
    label: "Content CMS",
    href: "/admin/content",
    icon: FileText,
    permission: "content:read",
  },
  {
    label: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
    permission: "discounts:read",
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    permission: "reviews:read",
  },
  {
    label: "Marketing & Pixels",
    href: "/admin/marketing",
    icon: BarChart3,
    permission: "marketing:read",
  },
  {
    label: "Staff & Roles",
    href: "/admin/users",
    icon: ShieldCheck,
    permission: "users:read",
  },
  {
    label: "Site Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings:read",
  },
  {
    label: "Audit Trail",
    href: "/admin/audit",
    icon: History,
    permission: "audit:read",
  },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, hasPermission, logout, switchRole } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const closeMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => { setIsMobile(media.matches); if (!media.matches) setMobileOpen(false); };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeMenu.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMobileOpen(false); }
      if (event.key !== 'Tab') return;
      const elements = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea') || []).filter(element => element.getClientRects().length > 0);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); menuTrigger.current?.focus({ preventScroll: true }); };
  }, [isMobile, mobileOpen]);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.permission),
  );

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const roleColors: Record<string, string> = {
    superadmin: "bg-brand-accent-muted text-brand-accent border-brand-accent/30",
    manager: "bg-brand-accent-muted text-brand-accent border-brand-accent/30",
    order_staff: "bg-black/5 text-brand-text border-black/10",
    content_editor: "bg-black/5 text-brand-text border-black/10",
  };

  return (
    <div className="admin-shell h-dvh overflow-hidden bg-white text-brand-text flex flex-col antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Dismiss navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <div className="flex min-h-0 flex-1">
        {/* ================================================================== */}
        {/* SIDEBAR                                                            */}
        {/* ================================================================== */}
        <aside
          ref={sidebar}
          aria-label="Admin navigation"
          role={isMobile && mobileOpen ? 'dialog' : undefined}
          aria-modal={isMobile && mobileOpen ? true : undefined}
          inert={isMobile && !mobileOpen}
          className={cn(
            "fixed top-0 bottom-0 left-0 z-50 h-dvh max-w-[calc(100vw-2rem)] bg-white border-r border-brand-border flex flex-col transition-all duration-300 ease-in-out",
            // Mobile sliding
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            // Desktop width
            sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[264px]",
            "w-[264px]",
          )}
        >
          {/* Brand Header */}
          <div className="h-16 shrink-0 px-4 flex items-center justify-between border-b border-brand-border">
            <Link
              href="/admin"
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-accent text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              {(!sidebarCollapsed || mobileOpen) && (
                <div className="min-w-0">
                  <span className="font-serif text-base font-semibold tracking-wide text-black block truncate leading-tight">
                    Ceylon Wall Decor
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-brand-accent font-medium block">
                    Admin Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile close button */}
            <button
              ref={closeMenu}
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-brand-muted hover:text-brand-text lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="min-h-0 flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                    active
                      ? "bg-brand-accent-muted text-brand-accent border border-brand-accent/30 shadow-xs"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-surface-hover/70",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      active
                        ? "text-brand-accent"
                        : "text-brand-muted group-hover:text-brand-text",
                    )}
                  />
                  {(!sidebarCollapsed || mobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-accent rounded-r-md" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Role Switcher in Sidebar Footer */}
          <div className="shrink-0 p-3 border-t border-brand-border bg-brand-surface">
            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-left transition-colors"
                title="Switch Active Testing Role"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.displayName ? user.displayName[0] : "A"}
                  </div>
                  {(!sidebarCollapsed || mobileOpen) && (
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-brand-text truncate">
                        {user?.displayName}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded border font-medium inline-block mt-0.5",
                          roleColors[role] || "text-brand-accent",
                        )}
                      >
                        {ROLE_LABELS[role as BuiltInRole] || role}
                      </span>
                    </div>
                  )}
                </div>
                {(!sidebarCollapsed || mobileOpen) && (
                  <UserCheck className="w-4 h-4 text-brand-muted hover:text-brand-accent shrink-0 ml-1" />
                )}
              </button>

              {/* Role Dropdown */}
              {roleSwitcherOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-white border border-brand-border shadow-xl z-50 space-y-1">
                  <p className="text-[11px] font-semibold text-brand-muted px-2 py-1 uppercase tracking-wider">
                    Switch Test Role:
                  </p>
                  {(
                    [
                      "superadmin",
                      "manager",
                      "order_staff",
                      "content_editor",
                    ] as BuiltInRole[]
                  ).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleSwitcherOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                        role === r
                          ? "bg-brand-accent-muted text-brand-accent border border-brand-accent/30"
                          : "text-brand-text hover:bg-brand-surface-hover",
                      )}
                    >
                      <span>{ROLE_LABELS[r]}</span>
                      {role === r && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logout button */}
            {(!sidebarCollapsed || mobileOpen) && (
              <button
                onClick={logout}
                className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-black hover:bg-black/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </aside>

        {/* ================================================================== */}
        {/* MAIN WRAPPER & TOP BAR                                             */}
        {/* ================================================================== */}
        <div
          inert={isMobile && mobileOpen}
          className={cn(
            "flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300",
            sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[264px]",
          )}
        >
          {/* Top Bar */}
          <header className="relative z-30 h-16 shrink-0 bg-white/85 backdrop-blur-md border-b border-brand-border px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <button
                ref={menuTrigger}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Sidebar Toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>

              <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-brand-muted font-medium border-l border-brand-border pl-3">
                Live Store Ops
              </span>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3">
              {/* View Storefront Link */}
              <Link
                href="/"
                target="_blank"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-surface text-xs font-medium text-brand-text transition-colors"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-accent" />
              </Link>

              {/* Active Role Tag */}
              <div
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                  roleColors[role] || "border-brand-border",
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{ROLE_LABELS[role as BuiltInRole] || role}</span>
              </div>

              {/* Real-time Notifications Bell */}
              <AdminNotifications />
            </div>
          </header>

          {/* Main Content Area */}
          <main id="admin-content" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
