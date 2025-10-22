import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Shield, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdmin } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { stats, users = [], usersLoading } = useAdmin();

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da plataforma e métricas principais
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const adminStats = {
    totalUsers: users.length,
    pendingKyc: stats?.pendingKycCount || 0,
    todayRevenue: stats?.todayRevenue || 0,
    activeBets: stats?.activeBets || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da plataforma e métricas principais
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você está acessando o painel administrativo com permissões elevadas.
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{adminStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-kyc">{adminStats.pendingKyc}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-today-revenue">
              R$ {adminStats.todayRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +8% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apostas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-bets">{adminStats.activeBets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em andamento agora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-elevate cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>Ver todos os usuários cadastrados</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Aprovar KYC</CardTitle>
                <CardDescription>{stats.pendingKyc} pendentes de aprovação</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>Monitorar todas as transações</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>Análises e métricas detalhadas</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
