import { useState } from "react";
import { useFraudAlerts, useUpdateFraudAlert } from "@/hooks/use-fraud-alerts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FraudAlert } from "@shared/schema";

export default function FraudAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  
  const { data: allAlerts, isLoading: loadingAll } = useFraudAlerts();
  const { data: pendingAlerts, isLoading: loadingPending } = useFraudAlerts("pending");
  const { data: investigatingAlerts, isLoading: loadingInvestigating } = useFraudAlerts("investigating");
  const { data: resolvedAlerts, isLoading: loadingResolved } = useFraudAlerts("resolved");
  
  const updateAlert = useUpdateFraudAlert();
  const { toast } = useToast();

  const handleUpdateStatus = async (alertId: string, status: string) => {
    try {
      await updateAlert.mutateAsync({ id: alertId, status, notes });
      toast({
        title: "Alerta atualizado",
        description: "Status do alerta foi atualizado com sucesso.",
      });
      setSelectedAlert(null);
      setNotes("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o alerta.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rapid_deposits: "Depósitos Rápidos",
      excessive_withdrawals: "Saques Excessivos",
      round_trip_transaction: "Transação Circular",
      transaction_velocity: "Velocidade de Transação",
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "investigating": return <AlertTriangle className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      case "false_positive": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderAlertsList = (alerts: FraudAlert[] | undefined, loading: boolean) => {
    if (loading) {
      return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
    }

    if (!alerts || alerts.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum alerta encontrado
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className="hover-elevate cursor-pointer"
            onClick={() => setSelectedAlert(alert)}
            data-testid={`card-fraud-alert-${alert.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getStatusIcon(alert.status)}
                    {getAlertTypeLabel(alert.alertType)}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    User ID: {alert.userId}
                  </CardDescription>
                </div>
                <Badge className={getSeverityColor(alert.severity)} data-testid={`badge-severity-${alert.id}`}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Detalhes:</span>{" "}
                  {JSON.stringify(alert.details)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" data-testid={`badge-status-${alert.id}`}>
                    {alert.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.triggeredAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Alertas de Fraude</h1>
        <p className="text-muted-foreground">
          Monitore e gerencie atividades suspeitas na plataforma
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="all" data-testid="tab-all">
            Todos ({allAlerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pendentes ({pendingAlerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="investigating" data-testid="tab-investigating">
            Em Análise ({investigatingAlerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">
            Resolvidos ({resolvedAlerts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderAlertsList(allAlerts, loadingAll)}
        </TabsContent>

        <TabsContent value="pending">
          {renderAlertsList(pendingAlerts, loadingPending)}
        </TabsContent>

        <TabsContent value="investigating">
          {renderAlertsList(investigatingAlerts, loadingInvestigating)}
        </TabsContent>

        <TabsContent value="resolved">
          {renderAlertsList(resolvedAlerts, loadingResolved)}
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {selectedAlert && getAlertTypeLabel(selectedAlert.alertType)}
            </DialogTitle>
            <DialogDescription>
              Revise e atualize o status deste alerta de fraude
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Severidade:</span>
                  <Badge className={`ml-2 ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Status Atual:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedAlert.status}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Detalhes do Alerta:</span>
                <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                  {JSON.stringify(selectedAlert.details, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-sm font-medium">User ID:</span>
                <p className="mt-1 font-mono text-sm">{selectedAlert.userId}</p>
              </div>

              <div>
                <span className="text-sm font-medium">Disparado em:</span>
                <p className="mt-1 text-sm">
                  {new Date(selectedAlert.triggeredAt).toLocaleString("pt-BR")}
                </p>
              </div>

              {selectedAlert.notes && (
                <div>
                  <span className="text-sm font-medium">Notas Anteriores:</span>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedAlert.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notas da Revisão:</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre este alerta..."
                  className="min-h-24"
                  data-testid="input-notes"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleUpdateStatus(selectedAlert.id, "investigating")}
                  disabled={updateAlert.isPending}
                  variant="outline"
                  data-testid="button-investigating"
                >
                  Marcar como Em Análise
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedAlert.id, "resolved")}
                  disabled={updateAlert.isPending}
                  variant="default"
                  data-testid="button-resolved"
                >
                  Resolver
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedAlert.id, "false_positive")}
                  disabled={updateAlert.isPending}
                  variant="secondary"
                  data-testid="button-false-positive"
                >
                  Falso Positivo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
