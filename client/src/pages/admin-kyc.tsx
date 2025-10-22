import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdmin } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle,
  Clock,
  FileText,
  User,
  Home
} from "lucide-react";

export default function AdminKyc() {
  const { pendingKyc = [], kycLoading, approveKycMutation, rejectKycMutation } = useAdmin();

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "id_front":
      case "id_back":
        return <User className="h-4 w-4" />;
      case "proof_address":
        return <Home className="h-4 w-4" />;
      case "selfie":
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentLabel = (type: string) => {
    const labels: Record<string, string> = {
      id_front: "RG/CNH (Frente)",
      id_back: "RG/CNH (Verso)",
      proof_address: "Comp. Residência",
      selfie: "Selfie",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Aprovações KYC</h1>
        <p className="text-muted-foreground mt-1">
          Analise e aprove documentos de verificação de identidade
        </p>
      </div>

      <div className="space-y-4">
        {kycLoading ? (
          <Card>
            <CardContent className="py-8">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : pendingKyc.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma verificação KYC pendente</p>
            </CardContent>
          </Card>
        ) : (
          pendingKyc.map((kyc) => (
            <Card key={kyc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {kyc.userId?.toString().charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Usuário #{kyc.userId}</CardTitle>
                      <CardDescription>Documento: {getDocumentLabel(kyc.documentType)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {kyc.status === "pending" ? "Pendente" : kyc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">Documento:</p>
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                      {getDocumentIcon(kyc.documentType)}
                      <span className="text-sm font-medium">{getDocumentLabel(kyc.documentType)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => approveKycMutation.mutate(kyc.id)}
                      disabled={approveKycMutation.isPending}
                      data-testid={`button-approve-${kyc.id}`}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {approveKycMutation.isPending ? "Aprovando..." : "Aprovar KYC"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => rejectKycMutation.mutate({ documentId: kyc.id, reason: "Documento ilegível ou inválido" })}
                      disabled={rejectKycMutation.isPending}
                      data-testid={`button-reject-${kyc.id}`}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {rejectKycMutation.isPending ? "Rejeitando..." : "Rejeitar"}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Enviado em {new Date(kyc.uploadedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}

      </div>
    </div>
  );
}
