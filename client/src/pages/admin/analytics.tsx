import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAnalyticsOverview, useAnalyticsTimeSeries, useTopUsers } from "@/hooks/use-analytics";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Trophy, 
  Gift, 
  AlertTriangle,
  DollarSign,
  Target,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">("day");
  const [topUsersLimit, setTopUsersLimit] = useState(10);

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: timeSeries, isLoading: timeSeriesLoading } = useAnalyticsTimeSeries(timePeriod);
  const { data: topUsers, isLoading: topUsersLoading } = useTopUsers(topUsersLimit);

  // Calculate profit margins and win rates
  const profitMargin = overview?.revenue?.totalWagered 
    ? ((overview.revenue.ggr / overview.revenue.totalWagered) * 100).toFixed(2)
    : "0.00";
  
  const winRate = overview?.bets?.total_bets 
    ? ((overview.bets.winning_bets / overview.bets.total_bets) * 100).toFixed(2)
    : "0.00";

  const averageBetSize = overview?.revenue?.totalWagered && overview?.bets?.total_bets
    ? (overview.revenue.totalWagered / overview.bets.total_bets)
    : 0;

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  // Format number
  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? parseInt(value) : value;
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  return (
    <div className="space-y-8" data-testid="page-analytics">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Analytics Dashboard</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Comprehensive platform metrics and insights
        </p>
      </div>

      {/* Hero Header */}
      <Card className="casino-gradient border-none text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <CardContent className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">Painel de Controle VIP</h2>
              <p className="text-white/80 text-lg">Visão geral completa da operação</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 pulse-gold" />
              <span className="text-sm">Sistema Online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <Card data-testid="card-users-stats" className="stat-card casino-card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-users">
                  {formatNumber(overview?.users.total_users || 0)}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" data-testid="text-active-users">
                    {formatNumber(overview?.users.active_users || 0)} ativos
                  </Badge>
                  <Badge variant="outline" data-testid="text-kyc-users">
                    {formatNumber(overview?.users.kyc_approved_users || 0)} KYC
                  </Badge>
                  <Badge variant="outline" data-testid="text-admin-users">
                    {formatNumber(overview?.users.admin_users || 0)} admin
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card data-testid="card-revenue-stats" className="stat-card casino-card-glow border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta (GGR)</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono text-primary" data-testid="text-ggr">
                  {formatCurrency(overview?.revenue.ggr || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="secondary" data-testid="text-total-wagered">
                    Apostado: {formatCurrency(overview?.revenue.totalWagered || 0)}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bets Card */}
        <Card data-testid="card-bets-stats" className="stat-card casino-card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Apostas</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-bets">
                  {formatNumber(overview?.bets.total_bets || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge className="bg-green-500 text-white" data-testid="text-winning-bets">
                    {formatNumber(overview?.bets.winning_bets || 0)} ganharam
                  </Badge>
                  <Badge variant="destructive" data-testid="text-losing-bets">
                    {formatNumber(overview?.bets.losing_bets || 0)} perderam
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card data-testid="card-transactions-stats" className="stat-card casino-card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-transactions">
                  {formatNumber(overview?.transactions.total_transactions || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge className="bg-green-500 text-white" data-testid="text-deposits-count">
                    {formatNumber(overview?.transactions.total_deposits || 0)} depósitos
                  </Badge>
                  <Badge className="bg-red-500 text-white" data-testid="text-withdrawals-count">
                    {formatNumber(overview?.transactions.total_withdrawals || 0)} saques
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Profit Margin Card */}
        <Card className="stat-card casino-card-glow border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {profitMargin}%
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Card */}
        <Card className="stat-card casino-card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Taxa de Vitória</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {winRate}%
            </div>
          </CardContent>
        </Card>

        {/* Average Bet Card */}
        <Card className="stat-card casino-card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Aposta Média</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(averageBetSize)}
            </div>
          </CardContent>
        </Card>

        {/* Bonuses Card */}
        <Card className="stat-card casino-card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Bônus Emitidos</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono text-primary" data-testid="text-bonus-value">
                  {formatCurrency(overview?.bonuses.bonus_value_issued || 0)}
                </div>
                <div className="flex gap-1 mt-1 text-xs">
                  <Badge variant="secondary" className="text-xs" data-testid="text-active-bonuses">
                    {formatNumber(overview?.bonuses.active_bonuses || 0)} ativos
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fraud Alerts Card */}
        <Card className="stat-card casino-card-glow border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Alertas de Fraude</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-500" data-testid="text-total-alerts">
                  {formatNumber(overview?.fraudAlerts.total_alerts || 0)}
                </div>
                <div className="flex gap-1 mt-1 text-xs">
                  <Badge variant="secondary" className="bg-amber-500 text-white text-xs" data-testid="text-pending-alerts">
                    {formatNumber(overview?.fraudAlerts.pending_alerts || 0)} pendentes
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card data-testid="card-time-series" className="casino-card-glow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Volume de Transações ao Longo do Tempo
              </CardTitle>
              <CardDescription>Análise de depósitos e saques por período</CardDescription>
            </div>
            <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as typeof timePeriod)}>
              <TabsList data-testid="tabs-period-selector" className="bg-muted">
                <TabsTrigger value="day" data-testid="tab-day">Diário</TabsTrigger>
                <TabsTrigger value="week" data-testid="tab-week">Semanal</TabsTrigger>
                <TabsTrigger value="month" data-testid="tab-month">Mensal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {timeSeriesLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="hsl(142, 71%, 45%)" 
                  strokeWidth={3}
                  name="Depósitos"
                  dot={{ fill: 'hsl(142, 71%, 45%)', r: 5 }}
                  activeDot={{ r: 7 }}
                  data-testid="line-deposits"
                />
                <Line 
                  type="monotone" 
                  dataKey="withdrawals" 
                  stroke="hsl(0, 72%, 55%)" 
                  strokeWidth={3}
                  name="Saques"
                  dot={{ fill: 'hsl(0, 72%, 55%)', r: 5 }}
                  activeDot={{ r: 7 }}
                  data-testid="line-withdrawals"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Users Table */}
      <Card data-testid="card-top-users" className="casino-card-glow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ranking VIP - Top Jogadores
              </CardTitle>
              <CardDescription>Maiores apostadores da plataforma</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={topUsersLimit === 10 ? "default" : "outline"}
                size="sm"
                onClick={() => setTopUsersLimit(10)}
                data-testid="button-top-10"
              >
                Top 10
              </Button>
              <Button
                variant={topUsersLimit === 25 ? "default" : "outline"}
                size="sm"
                onClick={() => setTopUsersLimit(25)}
                data-testid="button-top-25"
              >
                Top 25
              </Button>
              <Button
                variant={topUsersLimit === 50 ? "default" : "outline"}
                size="sm"
                onClick={() => setTopUsersLimit(50)}
                data-testid="button-top-50"
              >
                Top 50
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topUsersLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead data-testid="header-rank">#</TableHead>
                    <TableHead data-testid="header-username">Usuário</TableHead>
                    <TableHead data-testid="header-email">Email</TableHead>
                    <TableHead className="text-right" data-testid="header-wagered">Total Apostado</TableHead>
                    <TableHead className="text-right" data-testid="header-deposited">Total Depositado</TableHead>
                    <TableHead className="text-right" data-testid="header-bets">Qtd. Apostas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers && topUsers.length > 0 ? (
                    topUsers.map((user, index) => (
                      <TableRow 
                        key={user.id} 
                        data-testid={`row-user-${user.id}`}
                        className={`transition-colors ${index === 0 ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                      >
                        <TableCell data-testid={`text-rank-${index + 1}`}>
                          <Badge 
                            variant={index === 0 ? "default" : index < 3 ? "secondary" : "outline"}
                            className={index === 0 ? "bg-gradient-to-r from-primary to-primary/80" : ""}
                          >
                            {index === 0 && "👑"} #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-username-${user.id}`}>
                          {user.username}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-email-${user.id}`}>
                          {user.email}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-primary" data-testid={`text-wagered-${user.id}`}>
                          {formatCurrency(user.total_wagered)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600" data-testid={`text-deposited-${user.id}`}>
                          {formatCurrency(user.total_deposited)}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-bet-count-${user.id}`}>
                          <Badge variant="outline">
                            {formatNumber(user.bet_count)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12" data-testid="text-no-users">
                        Nenhum usuário com atividade de apostas encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
