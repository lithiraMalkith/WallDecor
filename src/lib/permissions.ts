// ============================================================================
// Ceylon Wall Decor — RBAC Permissions & Roles Matrix
// ============================================================================

import type { BuiltInRole } from "@/types";

export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard:read",
  PRODUCTS_READ: "products:read",
  PRODUCTS_WRITE: "products:write",
  PRODUCTS_DELETE: "products:delete",
  ORDERS_READ: "orders:read",
  ORDERS_WRITE: "orders:write",
  CUSTOM_REQUESTS_READ: "custom_requests:read",
  CUSTOM_REQUESTS_WRITE: "custom_requests:write",
  CUSTOMERS_READ: "customers:read",
  CUSTOMERS_WRITE: "customers:write",
  CATEGORIES_READ: "categories:read",
  CATEGORIES_WRITE: "categories:write",
  CATEGORIES_DELETE: "categories:delete",
  DELIVERY_READ: "delivery:read",
  DELIVERY_WRITE: "delivery:write",
  CONTENT_READ: "content:read",
  CONTENT_WRITE: "content:write",
  NOTIFICATIONS_READ: "notifications:read",
  NOTIFICATIONS_WRITE: "notifications:write",
  DISCOUNTS_READ: "discounts:read",
  DISCOUNTS_WRITE: "discounts:write",
  DISCOUNTS_DELETE: "discounts:delete",
  REVIEWS_READ: "reviews:read",
  REVIEWS_WRITE: "reviews:write",
  REVIEWS_DELETE: "reviews:delete",
  MESSAGES_READ: "messages:read",
  MESSAGES_WRITE: "messages:write",
  MESSAGES_DELETE: "messages:delete",
  MARKETING_READ: "marketing:read",
  MARKETING_WRITE: "marketing:write",
  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",
  ROLES_DELETE: "roles:delete",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  AUDIT_READ: "audit:read",
  AUDIT_WRITE: "audit:write",
  AUDIT_DELETE: "audit:delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export const BUILT_IN_ROLE_PERMISSIONS: Record<BuiltInRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS,

  manager: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.CUSTOM_REQUESTS_READ,
    PERMISSIONS.CUSTOM_REQUESTS_WRITE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_WRITE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.DELIVERY_READ,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_WRITE,
    PERMISSIONS.DISCOUNTS_READ,
    PERMISSIONS.DISCOUNTS_WRITE,
    PERMISSIONS.REVIEWS_READ,
    PERMISSIONS.REVIEWS_WRITE,
    PERMISSIONS.MESSAGES_READ,
    PERMISSIONS.MESSAGES_WRITE,
    PERMISSIONS.MESSAGES_DELETE,
    PERMISSIONS.AUDIT_READ,
  ],

  order_staff: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE, // restricted to fulfillment workflow transitions
    PERMISSIONS.CUSTOMERS_READ,
  ],

  content_editor: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_WRITE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
  ],
};

export const ROLE_LABELS: Record<BuiltInRole, string> = {
  superadmin: "Owner / Super Admin",
  manager: "Manager",
  order_staff: "Order Fulfillment Staff",
  content_editor: "Content & Catalog Editor",
};

export function hasRolePermission(
  role: BuiltInRole | string,
  permission: Permission | string,
  customRolePermissions?: string[],
): boolean {
  if (role === "superadmin") return true;
  if (customRolePermissions && customRolePermissions.length > 0) {
    return customRolePermissions.includes(permission);
  }
  const permissions = BUILT_IN_ROLE_PERMISSIONS[role as BuiltInRole];
  return permissions ? permissions.includes(permission as Permission) : false;
}
