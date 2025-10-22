import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface UserStats {
  totalBet?: string;
  totalWon?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch user stats (will be implemented in backend)
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  const getKycStatusInfo = () => {
    switch (user?.kycStatus) {
      case "approved":
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          text: "Verificado",
          color: "text-green-500",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          icon: Clock,
          text: "Pendente",
          color: "text-yellow-500",
        };
      case "under_review":
        return {
          variant: "secondary" as const,
          icon: Clock,
          text: "Em Análise",
          color: "text-blue-500",
        };
      case "rejected":
        return {
          variant: "destructive" as const,
          icon: AlertCircle,
          text: "Rejeitado",
          color: "text-red-500",
        };
      default:
        return {
          variant: "secondary" as const,
          icon: Shield,
          text: "Não verificado",
          color: "text-gray-500",
        };
    }
  };

  const kycStatus = getKycStatusInfo();
  const KycIcon = kycStatus.icon;

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Bem-vindo, {isAdmin ? "Administrador" : user?.fullName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? "Gerencie seus apostas, transações e saldo em um só lugar" : "Gerencie suas apostas, transações e saldo em um só lugar"}
        </p>
      </div>

      {/* KYC Alert - Hide for admins */}
      {!isAdmin && user?.kycStatus !== "approved" && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Shield className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="text-sm">
              {user?.kycStatus === "pending" && "Complete sua verificação KYC para liberar depósitos e saques."}
              {user?.kycStatus === "under_review" && "Seus documentos KYC estão sendo analisados. Aguarde aprovação."}
              {user?.kycStatus === "rejected" && "Sua verificação KYC foi rejeitada. Envie novos documentos."}
            </span>
            <Button variant="outline" size="sm" asChild>
              <a href="/kyc" data-testid="button-complete-kyc">
                {user?.kycStatus === "rejected" ? "Reenviar" : "Completar KYC"}
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-mono font-bold" data-testid="text-balance">
              R$ {parseFloat(user?.balance || "0").toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Atualizado em tempo real
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apostado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-mono font-bold" data-testid="text-total-bet">
              R$ {stats?.totalBet || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-mono font-bold text-green-500" data-testid="text-total-won">
              R$ {stats?.totalWon || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status KYC</CardTitle>
            <KycIcon className={`h-4 w-4 ${kycStatus.color}`} />
          </CardHeader>
          <CardContent>
            <Badge variant={kycStatus.variant} className="mt-1" data-testid="badge-kyc-status">
              {kycStatus.text}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Verificação de identidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Only show for regular users */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Gerencie sua carteira e apostas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button 
              disabled={user?.kycStatus !== "approved"}
              data-testid="button-deposit"
            >
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Depositar
            </Button>
            <Button 
              variant="outline"
              disabled={user?.kycStatus !== "approved"}
              data-testid="button-withdraw"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Sacar
            </Button>
            <Button variant="outline" asChild data-testid="button-view-bets">
              <a href="/bets">
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Apostas
              </a>
            </Button>
            <Button variant="outline" asChild data-testid="button-view-transactions">
              <a href="/transactions">
                <Wallet className="mr-2 h-4 w-4" />
                Histórico
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Suas últimas transações e apostas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhuma atividade recente</p>
            <p className="text-sm mt-1">Suas transações e apostas aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
