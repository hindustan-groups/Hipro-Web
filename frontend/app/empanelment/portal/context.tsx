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
