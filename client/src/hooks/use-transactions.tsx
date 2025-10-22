import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import type { Transaction } from "@shared/schema";

export function useTransactions() {
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: true,
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string }) => {
      const res = await apiRequest("POST", "/api/transactions/deposit", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Depósito realizado!",
        description: "Seu saldo foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no depósito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const res = await apiRequest("POST", "/api/transactions/withdraw", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Saque solicitado!",
        description: "Seu pedido está sendo processado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no saque",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    isLoading,
    depositMutation,
    withdrawMutation,
  };
}
