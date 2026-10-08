// ============================================================================
// Ceylon Wall Decor — Type-Safe Admin Client API
// ============================================================================

import type {
  Product,
  Order,
  CustomRequest,
  Customer,
  CategoryNode,
  SiteSettings,
  Promotion,
  Review,
  UserMessage,
  AuditLog,
  DashboardStats,
  ApiResponse,
} from "@/types";

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(path, { ...options, headers });
  
  let payload: ApiResponse<T>;
  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `API Request to ${path} failed with status ${response.status} (${response.statusText || "Server error"})`
    );
  }

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.error || `API Request Failed: ${response.statusText}`,
    );
  }

  return payload.data as T;
}

// ----------------------------------------------------------------------------
// Dashboard
// ----------------------------------------------------------------------------
export async function fetchDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>("/api/dashboard");
}

// ----------------------------------------------------------------------------
// Products
// ----------------------------------------------------------------------------
export async function fetchProducts(
  params?: Record<string, string>,
): Promise<Product[]> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchApi<Product[]>(`/api/products${query}`);
}

export async function fetchProduct(id: string): Promise<Product> {
  return fetchApi<Product>(`/api/products/${id}`);
}

export async function createProduct(
  payload: Partial<Product>,
): Promise<Product> {
  return fetchApi<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: string,
  payload: Partial<Product>,
): Promise<Product> {
  return fetchApi<Product>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(
  id: string,
): Promise<{ id: string; message: string }> {
  return fetchApi<{ id: string; message: string }>(`/api/products/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------------------------------
// Orders
// ----------------------------------------------------------------------------
export async function fetchOrders(
  params?: Record<string, string>,
): Promise<Order[]> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchApi<Order[]>(`/api/orders${query}`);
}

export async function fetchOrder(id: string): Promise<Order> {
  return fetchApi<Order>(`/api/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  payload: {
    status: Order["status"];
    trackingNumber?: string;
    courierName?: string;
    cancellationReason?: string;
    note?: string;
    phoneVerified?: boolean;
    cashCollected?: boolean;
  },
): Promise<Order> {
  return fetchApi<Order>(`/api/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------------------------------
// Custom Requests
// ----------------------------------------------------------------------------
export async function fetchCustomRequests(): Promise<CustomRequest[]> {
  return fetchApi<CustomRequest[]>("/api/custom-requests");
}

export async function fetchCustomRequest(id: string): Promise<CustomRequest> {
  return fetchApi<CustomRequest>(`/api/custom-requests/${id}`);
}

export async function updateCustomRequest(
  id: string,
  payload: Partial<CustomRequest>,
): Promise<CustomRequest> {
  return fetchApi<CustomRequest>(`/api/custom-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function convertCustomRequestToOrder(
  id: string,
  payload: { quotedPrice: number; deliveryFee?: number; notes?: string },
): Promise<Order> {
  return fetchApi<Order>(`/api/custom-requests/${id}/convert`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------------------------------
// Customers
// ----------------------------------------------------------------------------
export async function fetchCustomers(): Promise<Customer[]> {
  return fetchApi<Customer[]>("/api/customers");
}

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------
export async function fetchCategories(): Promise<CategoryNode[]> {
  return fetchApi<CategoryNode[]>("/api/categories");
}

export async function createCategory(
  payload: Partial<CategoryNode>,
): Promise<CategoryNode> {
  return fetchApi<CategoryNode>("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryNode>,
): Promise<CategoryNode> {
  return fetchApi<CategoryNode>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(
  id: string,
): Promise<{ id: string; message: string }> {
  return fetchApi<{ id: string; message: string }>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------------------------------
// Delivery & Settings
// ----------------------------------------------------------------------------
export async function fetchSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>("/api/settings");
}

export async function updateSiteSettings(
  payload: Partial<SiteSettings>,
): Promise<SiteSettings> {
  return fetchApi<SiteSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------------------------------
// Promotions
// ----------------------------------------------------------------------------
export async function fetchPromotions(): Promise<Promotion[]> {
  return fetchApi<Promotion[]>("/api/promotions");
}

export async function createPromotion(
  payload: Partial<Promotion>,
): Promise<Promotion> {
  return fetchApi<Promotion>("/api/promotions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePromotion(id: string): Promise<{ id: string }> {
  return fetchApi<{ id: string }>(`/api/promotions/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------------------------------
// Reviews
// ----------------------------------------------------------------------------
export async function fetchReviews(): Promise<Review[]> {
  return fetchApi<Review[]>("/api/reviews");
}

export async function createReview(
  payload: Partial<Review>,
): Promise<Review> {
  return fetchApi<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReview(
  id: string,
  payload: Partial<Review>,
): Promise<Review> {
  return fetchApi<Review>(`/api/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(id: string): Promise<{ id: string }> {
  return fetchApi<{ id: string }>(`/api/reviews/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------------------------------
// Customer Inquiries & Messages
// ----------------------------------------------------------------------------
export async function fetchMessages(status?: string): Promise<UserMessage[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetchApi<UserMessage[]>(`/api/messages${query}`);
}

export async function createMessage(
  payload: Partial<UserMessage>,
): Promise<UserMessage> {
  return fetchApi<UserMessage>("/api/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMessage(
  id: string,
  payload: Partial<UserMessage>,
): Promise<UserMessage> {
  return fetchApi<UserMessage>(`/api/messages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMessage(id: string): Promise<{ id: string }> {
  return fetchApi<{ id: string }>(`/api/messages/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------------------------------
// Audit Logs
// ----------------------------------------------------------------------------
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  return fetchApi<AuditLog[]>("/api/audit");
}
