import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Bonus } from "@shared/schema";

export function useBonuses(status?: string) {
  const queryKey = status ? ["/api/bonuses", status] : ["/api/bonuses"];
  
  return useQuery<Bonus[]>({
    queryKey,
    queryFn: async () => {
      const url = status ? `/api/bonuses?status=${status}` : "/api/bonuses";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch bonuses");
      return response.json();
    },
  });
}

export function useApplyPromoCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest(
        "POST",
        "/api/bonuses/apply-code",
        { code }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all bonus queries and balance
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          (query.queryKey[0] === "/api/bonuses" || query.queryKey[0] === "/api/user")
      });
    },
  });
}

// Admin hooks
export function useAdminBonuses() {
  return useQuery<Bonus[]>({
    queryKey: ["/api/admin/bonuses"],
    queryFn: async () => {
      const response = await fetch("/api/admin/bonuses", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch admin bonuses");
      return response.json();
    },
  });
}

export function useCreatePromotion() {
  return useMutation({
    mutationFn: async (data: {
      type: string;
      amount: number;
      wagerRequirement?: number;
      code?: string;
      description: string;
      expiresAt?: string;
    }) => {
      const response = await apiRequest(
        "POST",
        "/api/admin/bonuses",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bonuses"] });
    },
  });
}
