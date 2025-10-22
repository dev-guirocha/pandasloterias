// Casino Betting Platform - Complete Database Schema
// All data persisted in PostgreSQL - zero session/localStorage dependency

import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  decimal, 
  pgEnum,
  integer,
  jsonb,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums for type safety
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["pending", "under_review", "approved", "rejected"]);
export const documentTypeEnum = pgEnum("document_type", ["id_front", "id_back", "proof_address", "selfie"]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit", 
  "withdraw", 
  "bet_stake", 
  "bet_win", 
  "bet_refund",
  "bonus",
  "adjustment"
]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "processing", "completed", "failed", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["pix", "credit_card", "debit_card", "crypto"]);
export const betStatusEnum = pgEnum("bet_status", ["pending", "active", "won", "lost", "cancelled", "refunded"]);
export const gameTypeEnum = pgEnum("game_type", ["casino", "lottery", "jogo_bicho"]);

// Users table with wallet and KYC status
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  cpf: text("cpf").unique(), // Brazilian tax ID
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("user"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("pending"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// KYC Documents
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  fileUrl: text("file_url").notNull(),
  status: kycStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Financial Transactions (deposits, withdrawals, bets)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method"),
  externalId: text("external_id"), // Payment gateway transaction ID
  metadata: jsonb("metadata"), // Additional data (PIX key, card last 4, etc)
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Bets placed by users (ready for external game API integration)
export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  gameType: gameTypeEnum("game_type").notNull(),
  gameId: text("game_id"), // From external API
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  potentialWin: decimal("potential_win", { precision: 12, scale: 2 }),
  actualWin: decimal("actual_win", { precision: 12, scale: 2 }).default("0.00"),
  status: betStatusEnum("status").notNull().default("pending"),
  gameData: jsonb("game_data"), // Store external API game details
  result: jsonb("result"), // Store game result from external API
  placedAt: timestamp("placed_at").notNull().defaultNow(),
  settledAt: timestamp("settled_at"),
});

// Audit logs for security and compliance
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"), // user, transaction, bet, kyc, etc
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Fraud alerts for security monitoring
export const fraudStatusEnum = pgEnum("fraud_status", ["pending", "investigating", "resolved", "false_positive"]);
export const fraudSeverityEnum = pgEnum("fraud_severity", ["low", "medium", "high", "critical"]);

// Bonus system enums
export const bonusTypeEnum = pgEnum("bonus_type", ["welcome", "deposit_match", "cashback", "promotion", "referral"]);
export const bonusStatusEnum = pgEnum("bonus_status", ["pending", "active", "used", "expired", "cancelled"]);

export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  alertType: text("alert_type").notNull(), // rapid_deposits, multiple_withdrawals, suspicious_pattern, etc
  severity: fraudSeverityEnum("severity").notNull(),
  status: fraudStatusEnum("status").notNull().default("pending"),
  details: jsonb("details").notNull(),
  triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
});

// Bonus system for promotions and rewards
export const bonuses = pgTable("bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: bonusTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  wagerRequirement: decimal("wager_requirement", { precision: 12, scale: 2 }).default("0.00"), // Amount to wager before withdrawal
  currentWager: decimal("current_wager", { precision: 12, scale: 2 }).default("0.00"), // Amount already wagered
  status: bonusStatusEnum("status").notNull().default("pending"),
  code: text("code"), // Promo code if applicable
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  appliedAt: timestamp("applied_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification system enums
export const notificationTypeEnum = pgEnum("notification_type", ["email", "sms"]);
export const notificationStatusEnum = pgEnum("notification_status", ["pending", "sent", "failed"]);

// Notification templates for email and SMS
export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // deposit_completed, withdrawal_approved, bet_won, etc
  type: notificationTypeEnum("type").notNull(),
  subject: text("subject"), // For emails only
  content: text("content").notNull(), // Template with {{variables}}
  variables: jsonb("variables"), // List of available template variables
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User notifications (sent notifications log)
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: varchar("template_id").references(() => notificationTemplates.id),
  type: notificationTypeEnum("type").notNull(),
  subject: text("subject"), // For emails
  content: text("content").notNull(),
  status: notificationStatusEnum("status").notNull().default("pending"),
  metadata: jsonb("metadata"), // Additional data (recipient email/phone, error details, etc)
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User notification preferences
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  smsEnabled: boolean("sms_enabled").notNull().default(false),
  notifyDeposit: boolean("notify_deposit").notNull().default(true),
  notifyWithdrawal: boolean("notify_withdrawal").notNull().default(true),
  notifyBetWin: boolean("notify_bet_win").notNull().default(true),
  notifyKycStatus: boolean("notify_kyc_status").notNull().default(true),
  notifyBonus: boolean("notify_bonus").notNull().default(true),
  phoneNumber: text("phone_number"), // For SMS notifications
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Platform customization settings (admin-controlled)
export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  logoUrl: text("logo_url"), // URL to logo stored in object storage
  platformName: text("platform_name").notNull().default("BetPlatform"),
  primaryColor: text("primary_color").notNull().default("#10b981"), // emerald-500
  accentColor: text("accent_color").notNull().default("#8b5cf6"), // purple-500
  landingBanners: jsonb("landing_banners"), // Array of banner objects {imageUrl, title, subtitle, ctaText, ctaLink}
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  kycDocuments: many(kycDocuments),
  transactions: many(transactions),
  bets: many(bets),
  auditLogs: many(auditLogs),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, {
    fields: [kycDocuments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [kycDocuments.reviewedBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [bets.transactionId],
    references: [transactions.id],
  }),
}));

export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  user: one(users, {
    fields: [fraudAlerts.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [fraudAlerts.reviewedBy],
    references: [users.id],
  }),
}));

export const bonusesRelations = relations(bonuses, ({ one }) => ({
  user: one(users, {
    fields: [bonuses.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  template: one(notificationTemplates, {
    fields: [notifications.templateId],
    references: [notificationTemplates.id],
  }),
}));

export const notificationTemplatesRelations = relations(notificationTemplates, ({ many }) => ({
  notifications: many(notifications),
}));

export const userNotificationPreferencesRelations = relations(userNotificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationPreferences.userId],
    references: [users.id],
  }),
}));

// Insert Schemas with Zod validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  fullName: z.string().min(3, "Nome completo obrigatório"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos").optional(),
  phone: z.string().optional(),
}).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  cpf: true,
  phone: true,
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
  settledAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  triggeredAt: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const insertBonusSchema = createInsertSchema(bonuses).omit({
  id: true,
  createdAt: true,
  appliedAt: true,
  usedAt: true,
});

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type FraudAlert = typeof fraudAlerts.$inferSelect;

export type InsertBonus = z.infer<typeof insertBonusSchema>;
export type Bonus = typeof bonuses.$inferSelect;

export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertUserNotificationPreferences = z.infer<typeof insertUserNotificationPreferencesSchema>;
export type UserNotificationPreferences = typeof userNotificationPreferences.$inferSelect;

export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettings.$inferSelect;
