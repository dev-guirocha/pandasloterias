import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Activity,
  Zap,
  Target,
  Gift
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdmin } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

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
      {/* Hero Section */}
      <Card className="casino-gradient border-none text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Badge className="bg-white/20 text-white mb-3">
                🎰 Painel VIP Administrativo
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2">Dashboard Admin</h1>
              <p className="text-white/90 text-lg">
                Controle total da plataforma de apostas
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="w-3 h-3 rounded-full bg-green-400 pulse-gold" />
              <div>
                <p className="text-sm font-semibold">Sistema Online</p>
                <p className="text-xs text-white/70">Todos os serviços ativos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Acesso Administrativo:</strong> Você tem permissões elevadas. Tome cuidado com suas ações.
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card casino-card-glow hover:border-primary/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="text-total-users">{adminStats.totalUsers}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-500/10 text-green-600 text-xs">+12%</Badge>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card casino-card-glow hover:border-amber-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Pendentes</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500" data-testid="text-pending-kyc">{adminStats.pendingKyc}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-amber-500/10 text-amber-600 text-xs">
                {adminStats.pendingKyc > 0 ? 'Ação Necessária' : 'Tudo Ok'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card casino-card-glow hover:border-green-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-green-500" data-testid="text-today-revenue">
              R$ {adminStats.todayRevenue.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-500/10 text-green-600 text-xs">+8%</Badge>
              <span className="text-xs text-muted-foreground">vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card casino-card-glow hover:border-primary/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apostas Ativas</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="text-active-bets">{adminStats.activeBets}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-primary/10 text-primary text-xs">Ao Vivo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:border-primary/50 cursor-pointer transition-all casino-card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Usuários</CardTitle>
                  <CardDescription className="text-sm">Gerenciar todos os usuários</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/kyc">
          <Card className="hover:border-amber-500/50 cursor-pointer transition-all casino-card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/20">
                  <Shield className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    KYC
                    {stats.pendingKyc > 0 && (
                      <Badge className="bg-amber-500 text-white">{stats.pendingKyc}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">Aprovar verificações</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/fraud-alerts">
          <Card className="hover:border-red-500/50 cursor-pointer transition-all casino-card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Fraudes</CardTitle>
                  <CardDescription className="text-sm">Monitorar alertas</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:border-primary/50 cursor-pointer transition-all casino-card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Analytics</CardTitle>
                  <CardDescription className="text-sm">Métricas e relatórios</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/bonuses">
          <Card className="hover:border-purple-500/50 cursor-pointer transition-all casino-card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/20">
                  <Gift className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Bônus</CardTitle>
                  <CardDescription className="text-sm">Criar promoções</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:border-primary/50 cursor-pointer transition-all casino-card-glow h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Configurações</CardTitle>
                  <CardDescription className="text-sm">Personalizar plataforma</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
