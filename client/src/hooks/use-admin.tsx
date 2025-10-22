import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import type { User, KycDocument } from "@shared/schema";

export function useAdmin() {
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: true,
  });

  // Fetch pending KYC documents
  const { data: pendingKyc = [], isLoading: kycLoading } = useQuery<KycDocument[]>({
    queryKey: ["/api/admin/kyc/pending"],
    enabled: true,
  });

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: true,
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${data.userId}/role`, { role: data.role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role atualizado",
        description: "O role do usuário foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve KYC mutation
  const approveKycMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/kyc/${documentId}/approve`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "KYC aprovado",
        description: "O documento foi aprovado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aprovar KYC",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject KYC mutation
  const rejectKycMutation = useMutation({
    mutationFn: async (data: { documentId: number; reason: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/kyc/${data.documentId}/reject`, { reason: data.reason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      toast({
        title: "KYC rejeitado",
        description: "O documento foi rejeitado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao rejeitar KYC",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users,
    usersLoading,
    pendingKyc,
    kycLoading,
    stats,
    updateUserRoleMutation,
    approveKycMutation,
    rejectKycMutation,
  };
}
