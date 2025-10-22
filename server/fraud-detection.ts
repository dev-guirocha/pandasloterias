import { storage } from "./storage";
import { db } from "./db";
import { transactions } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function detectSuspiciousActivity(userId: string) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Check for rapid deposits (multiple deposits in 1 hour)
  const recentDeposits = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "deposit"),
        gte(transactions.createdAt, oneHourAgo)
      )
    );

  if (recentDeposits.length >= 5) {
    await storage.createFraudAlert({
      userId,
      alertType: "rapid_deposits",
      severity: "high",
      details: {
        count: recentDeposits.length,
        totalAmount: recentDeposits.reduce((sum, t) => sum + parseFloat(t.amount), 0),
        timeWindow: "1 hour",
      },
    });
    return true;
  }

  // Check for suspicious withdrawal patterns (multiple withdrawals in 24h)
  const recentWithdrawals = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "withdraw"),
        gte(transactions.createdAt, oneDayAgo)
      )
    );

  if (recentWithdrawals.length >= 10) {
    await storage.createFraudAlert({
      userId,
      alertType: "excessive_withdrawals",
      severity: "medium",
      details: {
        count: recentWithdrawals.length,
        totalAmount: recentWithdrawals.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0),
        timeWindow: "24 hours",
      },
    });
    return true;
  }

  // Check for round-trip pattern (deposit followed by immediate withdrawal)
  if (recentDeposits.length > 0 && recentWithdrawals.length > 0) {
    const depositTime = new Date(recentDeposits[0].createdAt).getTime();
    const withdrawTime = new Date(recentWithdrawals[0].createdAt).getTime();
    const timeDiff = Math.abs(withdrawTime - depositTime) / (1000 * 60); // in minutes

    if (timeDiff < 30) { // Less than 30 minutes between deposit and withdrawal
      await storage.createFraudAlert({
        userId,
        alertType: "round_trip_transaction",
        severity: "critical",
        details: {
          depositAmount: recentDeposits[0].amount,
          withdrawAmount: recentWithdrawals[0].amount,
          timeDiffMinutes: Math.round(timeDiff),
        },
      });
      return true;
    }
  }

  return false;
}

export async function checkTransactionVelocity(userId: string): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  
  const recentTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.createdAt, oneMinuteAgo)
      )
    );

  // More than 5 transactions in 1 minute is suspicious
  if (recentTransactions.length > 5) {
    await storage.createFraudAlert({
      userId,
      alertType: "transaction_velocity",
      severity: "high",
      details: {
        count: recentTransactions.length,
        timeWindow: "1 minute",
      },
    });
    return true;
  }

  return false;
}
