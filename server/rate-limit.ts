import rateLimit from "express-rate-limit";

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Muitas requisições deste IP, tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Muitas tentativas de login, tente novamente em 15 minutos.",
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limit for transactions
export const transactionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 transactions per minute
  message: "Limite de transações excedido, aguarde um momento.",
});

// Rate limit for KYC uploads
export const kycRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 uploads per hour
  message: "Limite de uploads excedido, tente novamente mais tarde.",
});
