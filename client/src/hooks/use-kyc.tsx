import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import type { KycDocument } from "@shared/schema";

export function useKyc() {
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery<KycDocument[]>({
    queryKey: ["/api/kyc"],
    enabled: true,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { documentType: string; fileUrl: string }) => {
      const res = await apiRequest("POST", "/api/kyc/upload", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Documento enviado!",
        description: "Seu documento está sendo analisado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar documento",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    uploadDocumentMutation,
  };
}
