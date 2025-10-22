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

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <Card data-testid="card-users-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
                  <span data-testid="text-active-users">
                    {formatNumber(overview?.users.active_users || 0)} active
                  </span>
                  <span data-testid="text-kyc-users">
                    {formatNumber(overview?.users.kyc_approved_users || 0)} KYC
                  </span>
                  <span data-testid="text-admin-users">
                    {formatNumber(overview?.users.admin_users || 0)} admin
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card data-testid="card-revenue-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GGR (Revenue)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono" data-testid="text-ggr">
                  {formatCurrency(overview?.revenue.ggr || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span data-testid="text-total-wagered">
                    Wagered: {formatCurrency(overview?.revenue.totalWagered || 0)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bets Card */}
        <Card data-testid="card-bets-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
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
                  <span className="text-green-600" data-testid="text-winning-bets">
                    {formatNumber(overview?.bets.winning_bets || 0)} won
                  </span>
                  <span className="text-red-600" data-testid="text-losing-bets">
                    {formatNumber(overview?.bets.losing_bets || 0)} lost
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card data-testid="card-transactions-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-transactions">
                  {formatNumber(overview?.transactions.total_transactions || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span data-testid="text-deposits-count">
                    {formatNumber(overview?.transactions.total_deposits || 0)} deposits
                  </span>
                  <span data-testid="text-withdrawals-count">
                    {formatNumber(overview?.transactions.total_withdrawals || 0)} withdrawals
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bonuses Card */}
        <Card data-testid="card-bonuses-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonuses Issued</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono" data-testid="text-bonus-value">
                  {formatCurrency(overview?.bonuses.bonus_value_issued || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span data-testid="text-active-bonuses">
                    {formatNumber(overview?.bonuses.active_bonuses || 0)} active
                  </span>
                  <span data-testid="text-total-bonuses">
                    {formatNumber(overview?.bonuses.total_bonuses || 0)} total
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fraud Alerts Card */}
        <Card data-testid="card-fraud-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-alerts">
                  {formatNumber(overview?.fraudAlerts.total_alerts || 0)}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-amber-600" data-testid="text-pending-alerts">
                    {formatNumber(overview?.fraudAlerts.pending_alerts || 0)} pending
                  </span>
                  <span className="text-green-600" data-testid="text-resolved-alerts">
                    {formatNumber(overview?.fraudAlerts.resolved_alerts || 0)} resolved
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Deposit Volume Card */}
        <Card data-testid="card-deposit-volume">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposit Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono text-green-600" data-testid="text-deposit-volume">
                  {formatCurrency(overview?.transactions.deposit_volume || 0)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Volume Card */}
        <Card data-testid="card-withdrawal-volume">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawal Volume</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono text-red-600" data-testid="text-withdrawal-volume">
                  {formatCurrency(overview?.transactions.withdrawal_volume || 0)}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card data-testid="card-time-series">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction Volume Over Time</CardTitle>
              <CardDescription>Deposits and withdrawals by period</CardDescription>
            </div>
            <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as typeof timePeriod)}>
              <TabsList data-testid="tabs-period-selector">
                <TabsTrigger value="day" data-testid="tab-day">Daily</TabsTrigger>
                <TabsTrigger value="week" data-testid="tab-week">Weekly</TabsTrigger>
                <TabsTrigger value="month" data-testid="tab-month">Monthly</TabsTrigger>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="hsl(142, 71%, 45%)" 
                  strokeWidth={2}
                  name="Deposits"
                  data-testid="line-deposits"
                />
                <Line 
                  type="monotone" 
                  dataKey="withdrawals" 
                  stroke="hsl(0, 72%, 55%)" 
                  strokeWidth={2}
                  name="Withdrawals"
                  data-testid="line-withdrawals"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Users Table */}
      <Card data-testid="card-top-users">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Users by Wagering Volume</CardTitle>
              <CardDescription>Highest volume players on the platform</CardDescription>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-rank">Rank</TableHead>
                  <TableHead data-testid="header-username">Username</TableHead>
                  <TableHead data-testid="header-email">Email</TableHead>
                  <TableHead className="text-right" data-testid="header-wagered">Total Wagered</TableHead>
                  <TableHead className="text-right" data-testid="header-deposited">Total Deposited</TableHead>
                  <TableHead className="text-right" data-testid="header-bets">Bet Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers && topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell data-testid={`text-rank-${index + 1}`}>
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </TableCell>
                      <TableCell className="text-right font-mono" data-testid={`text-wagered-${user.id}`}>
                        {formatCurrency(user.total_wagered)}
                      </TableCell>
                      <TableCell className="text-right font-mono" data-testid={`text-deposited-${user.id}`}>
                        {formatCurrency(user.total_deposited)}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`text-bet-count-${user.id}`}>
                        {formatNumber(user.bet_count)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground" data-testid="text-no-users">
                      No users with betting activity found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
