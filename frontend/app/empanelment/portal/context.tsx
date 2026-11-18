"use client";

import React, { createContext, useContext } from "react";

export interface VendorPortalUser {
  id: string;
  email: string;
  status: string;
  applicationId: string;
  application?: {
    id: string;
    trackingId: string;
    companyName: string;
    tradeName?: string | null;
    category?: string | null;
    tier: string;
    status: string;
    city?: string | null;
    phone: string;
    contactName: string;
  };
}

export interface VendorPortalContextType {
  vendor: VendorPortalUser | null;
  loading: boolean;
  refreshVendor: () => Promise<void>;
  logout: () => Promise<void>;
}

export const VendorPortalContext = createContext<VendorPortalContextType>({
  vendor: null,
  loading: true,
  refreshVendor: async () => {},
  logout: async () => {},
});

export const useVendorPortal = () => useContext(VendorPortalContext);

export function getVendorToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendor_token") || localStorage.getItem("hipro_vendor_token");
}

export function getVendorAuthHeaders(): Record<string, string> {
  const token = getVendorToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function vendorFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getVendorToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
