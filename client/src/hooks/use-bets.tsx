import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import type { Bet } from "@shared/schema";

export function useBets() {
  const { toast } = useToast();

  const { data: bets, isLoading } = useQuery<Bet[]>({
    queryKey: ["/api/bets"],
    enabled: true,
  });

  const placeBetMutation = useMutation({
    mutationFn: async (data: { 
      gameType: string; 
      gameId?: string; 
      amount: number; 
      gameData?: any;
    }) => {
      const res = await apiRequest("POST", "/api/bets", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Aposta realizada!",
        description: "Boa sorte!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao apostar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    bets,
    isLoading,
    placeBetMutation,
  };
}
