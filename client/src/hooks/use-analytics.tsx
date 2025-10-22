import { useQuery } from "@tanstack/react-query";

export interface AnalyticsOverview {
  users: {
    total_users: string;
    active_users: string;
    kyc_approved_users: string;
    admin_users: string;
  };
  transactions: {
    total_transactions: string;
    total_deposits: string;
    total_withdrawals: string;
    deposit_volume: string;
    withdrawal_volume: string;
  };
  bets: {
    total_bets: string;
    winning_bets: string;
    losing_bets: string;
    total_payouts: string;
  };
  bonuses: {
    total_bonuses: string;
    active_bonuses: string;
    bonus_value_issued: string;
  };
  fraudAlerts: {
    total_alerts: string;
    pending_alerts: string;
    resolved_alerts: string;
    investigating_alerts: string;
  };
  revenue: {
    ggr: string;
    totalWagered: string;
    totalPayouts: string;
  };
}

export interface TimeSeriesData {
  period: string;
  period_start: string;
  count: string;
  deposits: string;
  withdrawals: string;
}

export interface TopUser {
  id: string;
  username: string;
  email: string;
  total_wagered: string;
  total_deposited: string;
  bet_count: string;
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ["/api/admin/analytics"],
  });
}

export function useAnalyticsTimeSeries(period: "day" | "week" | "month") {
  return useQuery<TimeSeriesData[]>({
    queryKey: ["/api/admin/analytics/time-series", period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/time-series?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch time series data");
      }
      return response.json();
    },
  });
}

export function useTopUsers(limit: number = 10) {
  return useQuery<TopUser[]>({
    queryKey: ["/api/admin/analytics/top-users", limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/top-users?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch top users");
      }
      return response.json();
    },
  });
}
