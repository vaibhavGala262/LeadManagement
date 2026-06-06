"use client";

import { useState, useCallback } from "react";
import { LeadFormData } from "@/lib/validations";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LeadsResponse {
  data: Lead[];
  pagination: Pagination;
}

interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      order?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        if (params?.search) searchParams.set("q", params.search);
        if (params?.status) searchParams.set("status", params.status);
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.order) searchParams.set("order", params.order);

        const url = `/api/leads${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        const res = await fetch(url);

        if (!res.ok) {
          const errData: ApiError = await res.json();
          throw new Error(errData.error || "Failed to fetch leads");
        }

        const data: LeadsResponse = await res.json();
        setLeads(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createLead = useCallback(async (formData: LeadFormData) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err: ApiError = await res.json();
      throw new Error(err.details?.[0]?.message || err.error);
    }

    return res.json();
  }, []);

  const updateLead = useCallback(
    async (id: string, formData: LeadFormData & { status?: string }) => {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err: ApiError = await res.json();
        throw new Error(err.details?.[0]?.message || err.error);
      }

      return res.json();
    },
    []
  );

  const updateLeadStatus = useCallback(async (id: string, status: string) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err: ApiError = await res.json();
      throw new Error(err.error);
    }

    return res.json();
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err: ApiError = await res.json();
      throw new Error(err.error);
    }

    return res.json();
  }, []);

  return {
    leads,
    pagination,
    isLoading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
  };
}
