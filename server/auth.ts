// Authentication system using Passport.js and bcrypt
// From javascript_auth_all_persistance blueprint
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        if (!user.isActive) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).send("Nome de usuário já existe");
      }

      // Check if email exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email já cadastrado");
      }

      // Create user
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Create welcome bonus
      const welcomeBonus = await storage.createBonus({
        userId: user.id,
        type: "welcome",
        amount: "50.00", // R$50 welcome bonus
        wagerRequirement: "100.00", // Must wager R$100 before withdrawal
        description: "Bônus de boas-vindas! Aposte R$100 para sacar.",
        status: "active",
        appliedAt: new Date(),
      });

      // Add welcome bonus to balance
      const newBalance = parseFloat(user.balance) + 50;
      await storage.updateUser(user.id, { balance: newBalance.toString() });

      // Create bonus transaction
      await storage.createTransaction({
        userId: user.id,
        type: "bonus",
        amount: "50.00",
        balanceBefore: "0.00",
        balanceAfter: newBalance.toString(),
        status: "completed",
        description: "Bônus de boas-vindas",
      });

      // Create audit log
      await storage.createAuditLog({
        userId: user.id,
        action: "user_registered",
        entityType: "user",
        entityId: user.id,
        details: { username: user.username, email: user.email, welcomeBonus: true },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    // Create audit log
    if (req.user) {
      await storage.createAuditLog({
        userId: req.user.id,
        action: "user_login",
        entityType: "user",
        entityId: req.user.id,
        details: {},
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    }
    res.status(200).json(req.user);
  });

  app.post("/api/logout", async (req, res, next) => {
    if (req.user) {
      await storage.createAuditLog({
        userId: req.user.id,
        action: "user_logout",
        entityType: "user",
        entityId: req.user.id,
        details: {},
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    }

    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
}

// Middleware to check if user is admin
export function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.sendStatus(403);
}
