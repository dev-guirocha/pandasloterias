import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useKyc } from "@/hooks/use-kyc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload,
  FileText,
  User,
  Home
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function KycPage() {
  const { user } = useAuth();
  const { documents = [], uploadDocumentMutation } = useKyc();
  const [step, setStep] = useState(1);

  const handleDocumentUpload = (documentType: string) => {
    // Mock file upload - ready for object storage integration
    const mockFileUrl = `https://storage.example.com/kyc/${user?.id}/${documentType}_${Date.now()}.jpg`;
    uploadDocumentMutation.mutate({ documentType, fileUrl: mockFileUrl });
    setStep(step + 1);
  };

  const getStatusBadge = () => {
    switch (user?.kycStatus) {
      case "approved":
        return <Badge className="bg-green-500" data-testid="badge-kyc-approved"><CheckCircle2 className="mr-1 h-3 w-3" /> Aprovado</Badge>;
      case "under_review":
        return <Badge variant="secondary" data-testid="badge-kyc-review"><Clock className="mr-1 h-3 w-3" /> Em Análise</Badge>;
      case "rejected":
        return <Badge variant="destructive" data-testid="badge-kyc-rejected"><AlertCircle className="mr-1 h-3 w-3" /> Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-kyc-pending"><Clock className="mr-1 h-3 w-3" /> Pendente</Badge>;
    }
  };

  const documentTypes = [
    {
      type: "id_front",
      title: "RG/CNH (Frente)",
      description: "Foto da frente do seu documento de identificação",
      icon: User,
      required: true,
    },
    {
      type: "id_back",
      title: "RG/CNH (Verso)",
      description: "Foto do verso do seu documento de identificação",
      icon: User,
      required: true,
    },
    {
      type: "proof_address",
      title: "Comprovante de Residência",
      description: "Conta de luz, água ou telefone (últimos 3 meses)",
      icon: Home,
      required: true,
    },
    {
      type: "selfie",
      title: "Selfie com Documento",
      description: "Foto sua segurando o documento ao lado do rosto",
      icon: User,
      required: true,
    },
  ];

  const totalSteps = documentTypes.length;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Verificação KYC</h1>
            <p className="text-muted-foreground mt-1">
              Complete sua verificação para liberar todas as funcionalidades
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Status Alert */}
      {user?.kycStatus === "approved" && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            Sua conta está totalmente verificada! Você pode realizar depósitos, apostas e saques.
          </AlertDescription>
        </Alert>
      )}

      {user?.kycStatus === "under_review" && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Clock className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Seus documentos estão sendo analisados. Este processo leva até 24 horas úteis.
          </AlertDescription>
        </Alert>
      )}

      {user?.kycStatus === "rejected" && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            Sua verificação foi rejeitada. Por favor, envie novos documentos seguindo as orientações abaixo.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress */}
      {user?.kycStatus === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Verificação</CardTitle>
            <CardDescription>
              Etapa {step} de {totalSteps}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {progress.toFixed(0)}% completo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Document Upload */}
      <div className="grid gap-6 md:grid-cols-2">
        {documentTypes.map((doc, index) => {
          const DocIcon = doc.icon;
          const isCurrentStep = step === index + 1;
          
          return (
            <Card 
              key={doc.type} 
              className={isCurrentStep ? "border-primary" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <DocIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {doc.description}
                      </CardDescription>
                    </div>
                  </div>
                  {doc.required && (
                    <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou PDF até 5MB
                    </p>
                  </div>
                  <Button 
                    variant={isCurrentStep ? "default" : "outline"} 
                    className="w-full"
                    onClick={() => handleDocumentUpload(doc.type)}
                    disabled={uploadDocumentMutation.isPending}
                    data-testid={`button-upload-${doc.type}`}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadDocumentMutation.isPending ? "Enviando..." : `Enviar ${doc.title}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <p>Todos os documentos são criptografados e armazenados com segurança</p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <p>As fotos devem estar nítidas e todos os dados legíveis</p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <p>O processo de verificação leva até 24 horas úteis</p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <p>Você receberá uma notificação quando a análise for concluída</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
