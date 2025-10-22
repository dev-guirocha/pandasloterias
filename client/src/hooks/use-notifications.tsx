import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UserNotificationPreferences, Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useNotificationPreferences() {
  return useQuery<UserNotificationPreferences>({
    queryKey: ["/api/notifications/preferences"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateNotificationPreferences() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<UserNotificationPreferences>) => {
      const response = await apiRequest(
        "PUT",
        "/api/notifications/preferences",
        updates
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useNotifications(limit = 50) {
  return useQuery<Notification[]>({
    queryKey: ["/api/notifications", limit],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
