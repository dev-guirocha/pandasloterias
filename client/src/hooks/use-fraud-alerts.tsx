import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FraudAlert } from "@shared/schema";

export function useFraudAlerts(status?: string) {
  const queryKey = status ? ["/api/admin/fraud-alerts", status] : ["/api/admin/fraud-alerts"];
  
  return useQuery<FraudAlert[]>({
    queryKey,
    queryFn: async () => {
      const url = status 
        ? `/api/admin/fraud-alerts?status=${status}` 
        : "/api/admin/fraud-alerts";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch fraud alerts");
      return response.json();
    },
  });
}

export function useUpdateFraudAlert() {
  return useMutation({
    mutationFn: async ({ id, status, notes }: { 
      id: string; 
      status: string; 
      notes?: string 
    }) => {
      const response = await apiRequest(
        "PUT",
        `/api/admin/fraud-alerts/${id}`,
        { status, notes }
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate all fraud alert queries (base + all status filters)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          query.queryKey[0] === "/api/admin/fraud-alerts"
      });
    },
  });
}
