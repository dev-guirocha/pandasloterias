// API Routes and WebSocket server
// Comprehensive betting platform backend
import type { Express } from "express";
import { createServer, type Server } from "http";
// WebSocket removed - using local PostgreSQL instead of Neon
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { detectSuspiciousActivity, checkTransactionVelocity } from "./fraud-detection";
import { transactionRateLimit, kycRateLimit } from "./rate-limit";

// WebSocket removed - using local PostgreSQL

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // ============ WALLET & TRANSACTIONS ============

  // Get user stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactions(userId, 30);
      const bets = await storage.getBets(userId, 30);

      const totalBet = bets
        .filter(b => b.status !== 'cancelled' && b.status !== 'refunded')
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

      const totalWon = bets
        .filter(b => b.status === 'won')
        .reduce((sum, b) => sum + parseFloat(b.actualWin || "0"), 0);

      res.json({
        totalBet: totalBet.toFixed(2),
        totalWon: totalWon.toFixed(2),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Get user transactions
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar transações" });
    }
  });

  // Create deposit (mock payment integration)
  app.post("/api/transactions/deposit", isAuthenticated, transactionRateLimit, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      // Check transaction velocity
      const velocityAlert = await checkTransactionVelocity(userId);
      if (velocityAlert) {
        return res.status(429).json({ error: "Muitas transações em curto período. Aguarde um momento." });
      }

      const schema = z.object({
        amount: z.number().positive(),
        paymentMethod: z.enum(["pix", "credit_card", "debit_card", "crypto"]),
      });

      const { amount, paymentMethod } = schema.parse(req.body);
      const currentBalance = parseFloat(user.balance);
      const newBalance = currentBalance + amount;

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        status: "completed", // Mock: instant approval
        paymentMethod,
        metadata: { method: paymentMethod },
        description: `Depósito via ${paymentMethod}`,
      });

      // Update user balance
      await storage.updateUser(userId, { balance: newBalance.toString() });

      // Check for suspicious activity after deposit
      await detectSuspiciousActivity(userId);

      // Audit log
      await storage.createAuditLog({
        userId,
        action: "deposit_completed",
        entityType: "transaction",
        entityId: transaction.id,
        details: { amount, method: paymentMethod },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      // WebSocket notifications removed

      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao processar depósito" });
    }
  });

  // Create withdrawal
  app.post("/api/transactions/withdraw", isAuthenticated, transactionRateLimit, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      // Check transaction velocity
      const velocityAlert = await checkTransactionVelocity(userId);
      if (velocityAlert) {
        return res.status(429).json({ error: "Muitas transações em curto período. Aguarde um momento." });
      }

      const schema = z.object({
        amount: z.number().positive(),
      });

      const { amount } = schema.parse(req.body);
      const currentBalance = parseFloat(user.balance);

      if (amount > currentBalance) {
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      // KYC required for ANY withdrawal
      if (user.kycStatus !== "approved") {
        return res.status(403).json({ 
          error: "Para realizar saques, é necessário completar a verificação KYC primeiro. Acesse 'Verificação KYC' no menu." 
        });
      }

      const newBalance = currentBalance - amount;

      const transaction = await storage.createTransaction({
        userId,
        type: "withdraw",
        amount: (-amount).toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        status: "pending", // Withdrawals need processing
        paymentMethod: "pix",
        description: "Solicitação de saque",
      });

      await storage.updateUser(userId, { balance: newBalance.toString() });

      // Check for suspicious activity after withdrawal
      await detectSuspiciousActivity(userId);

      await storage.createAuditLog({
        userId,
        action: "withdrawal_requested",
        entityType: "transaction",
        entityId: transaction.id,
        details: { amount },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      // WebSocket notifications removed

      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao processar saque" });
    }
  });

  // ============ BETS ============

  // Get user bets
  app.get("/api/bets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const bets = await storage.getBets(userId, limit);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar apostas" });
    }
  });

  // Place bet (mock - ready for external API integration)
  app.post("/api/bets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      const schema = z.object({
        gameType: z.enum(["casino", "lottery", "jogo_bicho"]),
        gameId: z.string().optional(),
        amount: z.number().positive(),
        gameData: z.any().optional(),
      });

      const { gameType, gameId, amount, gameData } = schema.parse(req.body);
      const currentBalance = parseFloat(user.balance);

      if (amount > currentBalance) {
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      const newBalance = currentBalance - amount;

      // Create bet transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "bet_stake",
        amount: (-amount).toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        status: "completed",
        description: `Aposta em ${gameType}`,
      });

      // Create bet record
      const bet = await storage.createBet({
        userId,
        transactionId: transaction.id,
        gameType,
        gameId,
        amount: amount.toString(),
        potentialWin: (amount * 2).toString(), // Mock multiplier
        status: "pending",
        gameData,
      });

      await storage.updateUser(userId, { balance: newBalance.toString() });

      await storage.createAuditLog({
        userId,
        action: "bet_placed",
        entityType: "bet",
        entityId: bet.id,
        details: { gameType, amount },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      // WebSocket notifications removed

      res.json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar aposta" });
    }
  });

  // ============ KYC ============

  // Get user KYC documents
  app.get("/api/kyc", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const documents = await storage.getKycDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar documentos KYC" });
    }
  });

  // Upload KYC document (mock - ready for object storage integration)
  app.post("/api/kyc/upload", isAuthenticated, kycRateLimit, async (req, res) => {
    try {
      const userId = req.user!.id;

      const schema = z.object({
        documentType: z.enum(["id_front", "id_back", "proof_address", "selfie"]),
        fileUrl: z.string().url(),
      });

      const { documentType, fileUrl } = schema.parse(req.body);

      const document = await storage.createKycDocument({
        userId,
        documentType,
        fileUrl,
        status: "pending",
      });

      // Check if all documents submitted, update user KYC status
      const allDocs = await storage.getKycDocuments(userId);
      const requiredTypes = ["id_front", "id_back", "proof_address", "selfie"];
      const submittedTypes = allDocs.map(d => d.documentType);
      
      if (requiredTypes.every(type => submittedTypes.includes(type))) {
        await storage.updateUser(userId, { kycStatus: "under_review" });
      }

      await storage.createAuditLog({
        userId,
        action: "kyc_document_uploaded",
        entityType: "kyc_document",
        entityId: document.id,
        details: { documentType },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao enviar documento" });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  // Suspend user account (admin only)
  app.patch("/api/admin/users/:userId/suspend", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.updateUser(userId, { isActive: false });
      
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "user_suspended",
        entityType: "user",
        entityId: userId,
        details: { suspendedBy: req.user!.username },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json({ success: true, message: "Usuário suspenso com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao suspender usuário" });
    }
  });

  // Activate user account (admin only)
  app.patch("/api/admin/users/:userId/activate", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.updateUser(userId, { isActive: true });
      
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "user_activated",
        entityType: "user",
        entityId: userId,
        details: { activatedBy: req.user!.username },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json({ success: true, message: "Usuário ativado com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao ativar usuário" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:userId", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Don't allow deleting admin users
      const user = await storage.getUser(userId);
      if (user?.role === "admin") {
        return res.status(403).json({ error: "Não é possível excluir usuários administradores" });
      }

      await storage.createAuditLog({
        userId: req.user!.id,
        action: "user_deleted",
        entityType: "user",
        entityId: userId,
        details: { deletedBy: req.user!.username, deletedUser: user?.username },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      await storage.deleteUser(userId);

      res.json({ success: true, message: "Usuário excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir usuário" });
    }
  });

  // Get platform stats (admin only)
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const pendingKyc = await storage.getPendingKycDocuments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate today's revenue from completed bets
      const allBets = await storage.getAllBets();
      const todayBets = allBets.filter((bet: any) => {
        const betDate = new Date(bet.createdAt);
        betDate.setHours(0, 0, 0, 0);
        return betDate.getTime() === today.getTime();
      });
      
      const todayRevenue = todayBets
        .filter((bet: any) => bet.status === 'lost')
        .reduce((sum: number, bet: any) => sum + parseFloat(bet.amount), 0);
      
      const activeBets = allBets.filter((bet: any) => bet.status === 'pending').length;

      res.json({
        totalUsers: users.length,
        pendingKycCount: pendingKyc.length,
        todayRevenue,
        activeBets,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Get all pending KYC approvals
  app.get("/api/admin/kyc/pending", isAdmin, async (req, res) => {
    try {
      const documents = await storage.getPendingKycDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar aprovações KYC" });
    }
  });

  // Approve/Reject KYC
  app.post("/api/admin/kyc/:documentId/review", isAdmin, async (req, res) => {
    try {
      const { documentId } = req.params;
      const reviewerId = req.user!.id;

      const schema = z.object({
        approved: z.boolean(),
        rejectionReason: z.string().optional(),
      });

      const { approved, rejectionReason } = schema.parse(req.body);

      const document = await storage.updateKycDocument(documentId, {
        status: approved ? "approved" : "rejected",
        rejectionReason: approved ? undefined : rejectionReason,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      });

      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      // If all documents approved, update user KYC status
      if (approved) {
        const allDocs = await storage.getKycDocuments(document.userId);
        const allApproved = allDocs.every(d => d.status === "approved");
        
        if (allApproved) {
          await storage.updateUser(document.userId, { kycStatus: "approved" });
        }
      } else {
        await storage.updateUser(document.userId, { kycStatus: "rejected" });
      }

      await storage.createAuditLog({
        userId: reviewerId,
        action: approved ? "kyc_approved" : "kyc_rejected",
        entityType: "kyc_document",
        entityId: documentId,
        details: { approved, userId: document.userId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao revisar KYC" });
    }
  });

  // Approve KYC (shorthand endpoint)
  app.patch("/api/admin/kyc/:documentId/approve", isAdmin, async (req, res) => {
    try {
      const { documentId } = req.params;
      const reviewerId = req.user!.id;

      const document = await storage.updateKycDocument(documentId, {
        status: "approved",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      });

      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      // If all documents approved, update user KYC status
      const allDocs = await storage.getKycDocuments(document.userId);
      const allApproved = allDocs.every(d => d.status === "approved");
      
      if (allApproved) {
        await storage.updateUser(document.userId, { kycStatus: "approved" });
      }

      await storage.createAuditLog({
        userId: reviewerId,
        action: "kyc_approved",
        entityType: "kyc_document",
        entityId: documentId,
        details: { approved: true, userId: document.userId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Erro ao aprovar KYC" });
    }
  });

  // Reject KYC (shorthand endpoint)
  app.patch("/api/admin/kyc/:documentId/reject", isAdmin, async (req, res) => {
    try {
      const { documentId } = req.params;
      const reviewerId = req.user!.id;
      
      const schema = z.object({
        reason: z.string().default("Documento ilegível ou inválido"),
      });

      const { reason } = schema.parse(req.body);

      const document = await storage.updateKycDocument(documentId, {
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      });

      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }

      await storage.updateUser(document.userId, { kycStatus: "rejected" });

      await storage.createAuditLog({
        userId: reviewerId,
        action: "kyc_rejected",
        entityType: "kyc_document",
        entityId: documentId,
        details: { approved: false, reason, userId: document.userId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao rejeitar KYC" });
    }
  });

  // ============ FRAUD ALERTS (ADMIN) ============

  // Get fraud alerts with optional status filter
  app.get("/api/admin/fraud-alerts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const alerts = await storage.getFraudAlerts(status);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar alertas de fraude" });
    }
  });

  // Update fraud alert status
  app.put("/api/admin/fraud-alerts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const alertId = req.params.id;
      const reviewerId = req.user!.id;

      const schema = z.object({
        status: z.enum(["pending", "investigating", "resolved", "false_positive"]),
        notes: z.string().optional(),
      });

      const { status, notes } = schema.parse(req.body);

      const alert = await storage.updateFraudAlert(alertId, {
        status,
        notes,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      });

      if (!alert) {
        return res.status(404).json({ error: "Alerta não encontrado" });
      }

      await storage.createAuditLog({
        userId: reviewerId,
        action: "fraud_alert_reviewed",
        entityType: "fraud_alert",
        entityId: alertId,
        details: { status, notes },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao atualizar alerta" });
    }
  });

  // ============ BONUS SYSTEM ============

  // Get user bonuses
  app.get("/api/bonuses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const status = req.query.status as string | undefined;
      const bonuses = await storage.getBonuses(userId, status);
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar bônus" });
    }
  });

  // Apply promo code
  app.post("/api/bonuses/apply-code", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Código obrigatório" });
      }

      // Find bonus by code (admin created promotions)
      const allBonuses = await storage.getAllBonuses();
      const promoBonus = allBonuses.find(
        b => b.code?.toLowerCase() === code.toLowerCase() && 
        b.status === "pending" && 
        (!b.expiresAt || new Date(b.expiresAt) > new Date())
      );

      if (!promoBonus) {
        return res.status(404).json({ error: "Código inválido ou expirado" });
      }

      // Check if user already used this promo
      const userBonuses = await storage.getBonuses(userId);
      const alreadyUsed = userBonuses.some(b => b.code === code);
      if (alreadyUsed) {
        return res.status(400).json({ error: "Código já utilizado" });
      }

      // Create user's bonus
      const userBonus = await storage.createBonus({
        userId,
        type: promoBonus.type,
        amount: promoBonus.amount,
        wagerRequirement: promoBonus.wagerRequirement,
        code: promoBonus.code,
        description: promoBonus.description,
        status: "active",
        appliedAt: new Date(),
      });

      // Add bonus to balance
      const user = await storage.getUser(userId);
      if (user) {
        const newBalance = parseFloat(user.balance) + parseFloat(userBonus.amount);
        await storage.updateUser(userId, { balance: newBalance.toString() });

        // Create bonus transaction
        await storage.createTransaction({
          userId,
          type: "bonus",
          amount: userBonus.amount,
          balanceBefore: user.balance,
          balanceAfter: newBalance.toString(),
          status: "completed",
          description: `Bônus: ${userBonus.description || "Promoção"}`,
        });

        // WebSocket notifications removed
      }

      res.json(userBonus);
    } catch (error) {
      res.status(500).json({ error: "Erro ao aplicar código" });
    }
  });

  // Admin: Get all bonuses
  app.get("/api/admin/bonuses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bonuses = await storage.getAllBonuses();
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar bônus" });
    }
  });

  // Admin: Create promotion bonus
  app.post("/api/admin/bonuses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(["promotion", "deposit_match", "cashback"]),
        amount: z.number().positive(),
        wagerRequirement: z.number().min(0).optional(),
        code: z.string().optional(),
        description: z.string(),
        expiresAt: z.string().optional(),
      });

      const data = schema.parse(req.body);

      const bonus = await storage.createBonus({
        userId: req.user!.id, // Admin as creator
        type: data.type,
        amount: data.amount.toString(),
        wagerRequirement: data.wagerRequirement?.toString() || "0.00",
        code: data.code?.toUpperCase(),
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        status: "pending", // Available for users to claim
      });

      res.json(bonus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar bônus" });
    }
  });

  // ============ NOTIFICATION SYSTEM ============

  // Get user notification preferences
  app.get("/api/notifications/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      let prefs = await storage.getUserNotificationPreferences(userId);
      
      // Create default preferences if they don't exist
      if (!prefs) {
        prefs = await storage.createUserNotificationPreferences({
          userId,
          emailEnabled: true,
          smsEnabled: false,
          notifyDeposit: true,
          notifyWithdrawal: true,
          notifyBetWin: true,
          notifyKycStatus: true,
          notifyBonus: true,
        });
      }
      
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar preferências" });
    }
  });

  // Update user notification preferences
  app.put("/api/notifications/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const schema = z.object({
        emailEnabled: z.boolean().optional(),
        smsEnabled: z.boolean().optional(),
        phoneNumber: z.string().optional().nullable(),
        notifyDeposit: z.boolean().optional(),
        notifyWithdrawal: z.boolean().optional(),
        notifyBetWin: z.boolean().optional(),
        notifyKycStatus: z.boolean().optional(),
        notifyBonus: z.boolean().optional(),
      });

      const updates = schema.parse(req.body);
      
      const prefs = await storage.updateUserNotificationPreferences(userId, updates);
      res.json(prefs);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao atualizar preferências" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar notificações" });
    }
  });

  // ============ ANALYTICS SYSTEM ============

  // Get platform analytics (admin only)
  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar analytics" });
    }
  });

  // Get transaction time series (admin only)
  app.get("/api/admin/analytics/time-series", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
      const data = await storage.getTransactionTimeSeries(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar série temporal" });
    }
  });

  // Get top users by wagering (admin only)
  app.get("/api/admin/analytics/top-users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topUsers = await storage.getTopUsers(limit);
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar top usuários" });
    }
  });

  // ============ PLATFORM SETTINGS ============

  // Get platform settings (public - for landing page)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      
      // Return only public fields, never expose internal IDs or audit data
      const publicSettings = settings ? {
        platformName: settings.platformName,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        landingBanners: settings.landingBanners,
      } : {
        platformName: "BetPlatform",
        primaryColor: "#10b981",
        accentColor: "#8b5cf6",
      };
      
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  // Get platform settings (admin only - full details)
  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  // Update platform settings (admin only)
  app.patch("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        logoUrl: z.string().optional(),
        platformName: z.string().optional(),
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        landingBanners: z.array(z.object({
          imageUrl: z.string(),
          title: z.string(),
          subtitle: z.string().optional(),
          ctaText: z.string().optional(),
          ctaLink: z.string().optional(),
        })).optional(),
      });

      const updates = schema.parse(req.body);
      const settings = await storage.updatePlatformSettings({
        ...updates,
        updatedBy: req.user!.id,
      });

      await storage.createAuditLog({
        userId: req.user!.id,
        action: "platform_settings_updated",
        entityType: "platform_settings",
        entityId: settings.id,
        details: updates,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao atualizar configurações" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server removed - using local PostgreSQL

  return httpServer;
}
