// Database storage implementation using PostgreSQL
// From javascript_database and javascript_auth_all_persistance blueprints
import { 
  users, 
  kycDocuments,
  transactions,
  bets,
  auditLogs,
  fraudAlerts,
  bonuses,
  notifications,
  notificationTemplates,
  userNotificationPreferences,
  platformSettings,
  type User, 
  type InsertUser,
  type KycDocument,
  type InsertKycDocument,
  type Transaction,
  type InsertTransaction,
  type Bet,
  type InsertBet,
  type AuditLog,
  type InsertAuditLog,
  type FraudAlert,
  type InsertFraudAlert,
  type Bonus,
  type InsertBonus,
  type Notification,
  type InsertNotification,
  type NotificationTemplate,
  type InsertNotificationTemplate,
  type UserNotificationPreferences,
  type InsertUserNotificationPreferences,
  type PlatformSettings,
  type InsertPlatformSettings
} from "@shared/schema";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // KYC methods
  getKycDocuments(userId: string): Promise<KycDocument[]>;
  createKycDocument(doc: InsertKycDocument): Promise<KycDocument>;
  updateKycDocument(id: string, updates: Partial<KycDocument>): Promise<KycDocument | undefined>;
  getPendingKycDocuments(): Promise<KycDocument[]>;

  // Transaction methods
  getTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;

  // Bet methods
  getBets(userId: string, limit?: number): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined>;
  getAllBets(): Promise<Bet[]>;

  // Audit log methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Notification methods
  getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | undefined>;
  createUserNotificationPreferences(prefs: InsertUserNotificationPreferences): Promise<UserNotificationPreferences>;
  updateUserNotificationPreferences(userId: string, updates: Partial<UserNotificationPreferences>): Promise<UserNotificationPreferences | undefined>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationTemplates(type?: string): Promise<NotificationTemplate[]>;
  
  // Platform settings methods
  getPlatformSettings(): Promise<PlatformSettings | undefined>;
  updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // KYC methods
  async getKycDocuments(userId: string): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.userId, userId))
      .orderBy(desc(kycDocuments.createdAt));
  }

  async createKycDocument(doc: InsertKycDocument): Promise<KycDocument> {
    const [document] = await db
      .insert(kycDocuments)
      .values(doc)
      .returning();
    return document;
  }

  async updateKycDocument(id: string, updates: Partial<KycDocument>): Promise<KycDocument | undefined> {
    const [doc] = await db
      .update(kycDocuments)
      .set(updates)
      .where(eq(kycDocuments.id, id))
      .returning();
    return doc || undefined;
  }

  async getPendingKycDocuments(): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.status, 'pending'))
      .orderBy(desc(kycDocuments.createdAt));
  }

  // Transaction methods
  async getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(tx)
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [tx] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return tx || undefined;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  // Bet methods
  async getBets(userId: string, limit: number = 50): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.placedAt))
      .limit(limit);
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values(bet)
      .returning();
    return newBet;
  }

  async updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined> {
    const [bet] = await db
      .update(bets)
      .set(updates)
      .where(eq(bets.id, id))
      .returning();
    return bet || undefined;
  }

  async getAllBets(): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .orderBy(desc(bets.placedAt));
  }

  // Audit log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  // Fraud alert methods
  async createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert> {
    const [fraudAlert] = await db
      .insert(fraudAlerts)
      .values(alert)
      .returning();
    return fraudAlert;
  }

  async getFraudAlerts(status?: string): Promise<FraudAlert[]> {
    if (status) {
      return await db
        .select()
        .from(fraudAlerts)
        .where(eq(fraudAlerts.status, status as any))
        .orderBy(desc(fraudAlerts.triggeredAt));
    }
    return await db
      .select()
      .from(fraudAlerts)
      .orderBy(desc(fraudAlerts.triggeredAt));
  }

  async updateFraudAlert(id: string, updates: Partial<FraudAlert>): Promise<FraudAlert | undefined> {
    const [alert] = await db
      .update(fraudAlerts)
      .set(updates)
      .where(eq(fraudAlerts.id, id))
      .returning();
    return alert || undefined;
  }

  // Bonus methods
  async createBonus(bonus: InsertBonus): Promise<Bonus> {
    const [newBonus] = await db
      .insert(bonuses)
      .values(bonus)
      .returning();
    return newBonus;
  }

  async getBonuses(userId: string, status?: string): Promise<Bonus[]> {
    if (status) {
      return await db
        .select()
        .from(bonuses)
        .where(and(
          eq(bonuses.userId, userId),
          eq(bonuses.status, status as any)
        ))
        .orderBy(desc(bonuses.createdAt));
    }
    return await db
      .select()
      .from(bonuses)
      .where(eq(bonuses.userId, userId))
      .orderBy(desc(bonuses.createdAt));
  }

  async getAllBonuses(): Promise<Bonus[]> {
    return await db
      .select()
      .from(bonuses)
      .orderBy(desc(bonuses.createdAt));
  }

  async updateBonus(id: string, updates: Partial<Bonus>): Promise<Bonus | undefined> {
    const [bonus] = await db
      .update(bonuses)
      .set(updates)
      .where(eq(bonuses.id, id))
      .returning();
    return bonus || undefined;
  }

  async deleteBonus(id: string): Promise<void> {
    await db
      .delete(bonuses)
      .where(eq(bonuses.id, id));
  }

  // Analytics methods
  async getAnalytics(): Promise<any> {
    // Get counts - fix destructuring, use .rows
    const userStatsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN kyc_status = 'approved' THEN 1 END) as kyc_approved_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
      FROM users`
    );
    const userStats = userStatsResult.rows[0] || {};

    const transactionStatsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN type = 'deposit' THEN 1 END) as total_deposits,
        COUNT(CASE WHEN type = 'withdraw' THEN 1 END) as total_withdrawals,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN CAST(amount AS DECIMAL) ELSE 0 END) as deposit_volume,
        SUM(CASE WHEN type = 'withdraw' AND status = 'completed' THEN ABS(CAST(amount AS DECIMAL)) ELSE 0 END) as withdrawal_volume
      FROM transactions`
    );
    const transactionStats = transactionStatsResult.rows[0] || {};

    // Calculate wagering and payouts from bets table (not transactions)
    const betStatsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_bets,
        COUNT(CASE WHEN status = 'won' THEN 1 END) as winning_bets,
        COUNT(CASE WHEN status = 'lost' THEN 1 END) as losing_bets,
        SUM(CAST(amount AS DECIMAL)) as total_wagered,
        SUM(CASE WHEN status = 'won' THEN CAST(potential_win AS DECIMAL) ELSE 0 END) as total_payouts
      FROM bets`
    );
    const betStats = betStatsResult.rows[0] || {};

    const bonusStatsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_bonuses,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bonuses,
        SUM(CASE WHEN status IN ('active', 'used') THEN CAST(amount AS DECIMAL) ELSE 0 END) as bonus_value_issued
      FROM bonuses`
    );
    const bonusStats = bonusStatsResult.rows[0] || {};

    const fraudStatsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_alerts,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_alerts,
        COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating_alerts
      FROM fraud_alerts`
    );
    const fraudStats = fraudStatsResult.rows[0] || {};

    // GGR (Gross Gaming Revenue) = total wagered - total payouts (from bets table)
    const totalWagered = parseFloat(betStats.total_wagered || "0");
    const totalPayouts = parseFloat(betStats.total_payouts || "0");
    const ggr = totalWagered - totalPayouts;

    return {
      users: userStats,
      transactions: transactionStats,
      bets: betStats,
      bonuses: bonusStats,
      fraudAlerts: fraudStats,
      revenue: {
        ggr: ggr.toFixed(2),
        totalWagered: totalWagered.toFixed(2),
        totalPayouts: totalPayouts.toFixed(2),
      }
    };
  }

  async getTransactionTimeSeries(period: 'day' | 'week' | 'month'): Promise<any[]> {
    const dateFormat = period === 'day' ? 'YYYY-MM-DD HH24:00' : 
                      period === 'week' ? 'YYYY-IW' : 
                      'YYYY-MM';
    
    // Adjust interval based on period
    const interval = period === 'day' ? '30 days' : 
                    period === 'week' ? '84 days' :  // ~12 weeks
                    '365 days';  // ~12 months
    
    const result = await pool.query(
      `SELECT 
        TO_CHAR(created_at, $1) as period,
        MIN(created_at) as period_start,
        COUNT(*) as count,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN CAST(amount AS DECIMAL) ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'withdraw' AND status = 'completed' THEN ABS(CAST(amount AS DECIMAL)) ELSE 0 END) as withdrawals
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY 1
      ORDER BY MIN(created_at) DESC`,
      [dateFormat]
    );

    return result.rows;
  }

  async getTopUsers(limit: number = 10): Promise<any[]> {
    // Use CTE to avoid row multiplication from JOIN
    // Calculate wagering from bets table, deposits from transactions
    const result = await pool.query(
      `WITH user_wagers AS (
        SELECT 
          user_id,
          SUM(CAST(amount AS DECIMAL)) as total_wagered
        FROM bets
        GROUP BY user_id
      ),
      user_deposits AS (
        SELECT 
          user_id,
          SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN CAST(amount AS DECIMAL) ELSE 0 END) as total_deposited
        FROM transactions
        GROUP BY user_id
      ),
      user_bets AS (
        SELECT 
          user_id,
          COUNT(*) as bet_count
        FROM bets
        GROUP BY user_id
      )
      SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(uw.total_wagered, 0) as total_wagered,
        COALESCE(ud.total_deposited, 0) as total_deposited,
        COALESCE(ub.bet_count, 0) as bet_count
      FROM users u
      LEFT JOIN user_wagers uw ON u.id = uw.user_id
      LEFT JOIN user_deposits ud ON u.id = ud.user_id
      LEFT JOIN user_bets ub ON u.id = ub.user_id
      WHERE u.role != 'admin' AND COALESCE(uw.total_wagered, 0) > 0
      ORDER BY COALESCE(uw.total_wagered, 0) DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  // Notification methods
  async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));
    return prefs || undefined;
  }

  async createUserNotificationPreferences(insertPrefs: InsertUserNotificationPreferences): Promise<UserNotificationPreferences> {
    const [prefs] = await db
      .insert(userNotificationPreferences)
      .values(insertPrefs)
      .returning();
    return prefs;
  }

  async updateUserNotificationPreferences(userId: string, updates: Partial<UserNotificationPreferences>): Promise<UserNotificationPreferences | undefined> {
    const [prefs] = await db
      .update(userNotificationPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userNotificationPreferences.userId, userId))
      .returning();
    return prefs || undefined;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getNotificationTemplates(type?: string): Promise<NotificationTemplate[]> {
    if (type) {
      return await db
        .select()
        .from(notificationTemplates)
        .where(and(
          eq(notificationTemplates.isActive, true),
          eq(notificationTemplates.type, type as any)
        ));
    }
    return await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.isActive, true));
  }

  // Platform settings methods
  async getPlatformSettings(): Promise<PlatformSettings | undefined> {
    const [settings] = await db.select().from(platformSettings).limit(1);
    return settings || undefined;
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    // Check if settings exist
    const existing = await this.getPlatformSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(platformSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(platformSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(platformSettings)
        .values({
          ...updates,
          platformName: updates.platformName || "BetPlatform",
          primaryColor: updates.primaryColor || "#10b981",
          accentColor: updates.accentColor || "#8b5cf6",
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
