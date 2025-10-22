# Casino & Betting Platform

## Overview

A comprehensive casino and betting platform built with a modern full-stack architecture. This application provides a complete gambling experience with user authentication, wallet management, KYC verification, betting systems, bonus system, fraud detection, and administrative controls. The platform is designed with a dark-first, casino-inspired aesthetic following Material Design principles combined with industry-standard betting platform patterns (similar to Stake, Bet365, DraftKings).

The application emphasizes trust and transparency through clear financial tracking, real-time balance updates, comprehensive transaction history, bonus tracking with wager requirements, fraud detection alerts, and a professional administrative interface for platform oversight.

## Recent Changes (October 19, 2025)

**Platform Customization System (Completed)**
- Created platform_settings table with fields: platformName, logoUrl, primaryColor, accentColor, landingBanners (JSONB), updatedBy (audit)
- Storage methods: getPlatformSettings, updatePlatformSettings (handles create/update automatically)
- Public endpoint: GET /api/settings - sanitized to return only public fields (platformName, logoUrl, primaryColor, accentColor, landingBanners)
- Admin endpoints: GET /api/admin/settings (full data), PATCH /api/admin/settings (with Zod validation and audit logging)
- Admin settings page: form with platformName input, primaryColor/accentColor pickers with hex inputs, visual color preview
- Landing page: dynamically displays platformName from settings API (header, features section, footer)
- Route /admin/settings added with sidebar navigation link ("Configurações")
- Security: public endpoint does not expose internal IDs, timestamps, or updatedBy user ID

**Admin Interface Improvements (Completed)**
- Admin sidebar now shows ONLY admin menu items (Analytics, Users, KYC Approvals, Fraud Alerts, Bonuses)
- Regular user menu items (Wallet, Bets, Transactions, etc.) completely hidden for admin role
- Admin dashboard hides user-specific "Quick Actions" card (deposit/withdraw buttons)
- Welcome message displays "Bem-vindo, Administrador!" for admin users
- KYC alerts hidden for admin users on dashboard

**Admin Backend Endpoints (Completed)**
- Added GET /api/admin/users - returns all users from database via getAllUsers storage method
- Added GET /api/admin/stats - returns platform statistics (totalUsers, pendingKycCount, todayRevenue, activeBets)
- Added PATCH /api/admin/kyc/:documentId/approve - approves KYC document and updates user status if all docs approved
- Added PATCH /api/admin/kyc/:documentId/reject - rejects KYC document and updates user status
- All endpoints properly gated with isAdmin middleware and return real database data (no mocks)

**KYC Logic Redesign (Completed)**
- KYC requirement REMOVED from deposits - all users can deposit regardless of KYC status
- KYC requirement REMOVED from general platform access
- KYC now ONLY required for withdrawals when ALL conditions met:
  1. Withdrawal amount >= R$100 AND
  2. User has NO active bonuses AND
  3. User's kyc_status is NOT 'approved'
- Error message for blocked withdrawals: "Para saques acima de R$100, é necessário completar a verificação KYC primeiro. Acesse 'Verificação KYC' no menu."
- Withdrawals < R$100 process without KYC check
- Withdrawals with active bonuses bypass KYC requirement (even if >= R$100)

**Landing Page Implementation (Completed)**
- Created public landing page at "/" with hero section, game categories, and features
- Hero section with R$50 bonus promotion and "Começar Agora" CTA
- Game category cards: Slots, Casino Ao Vivo, Apostas Esportivas, Jogos Rápidos
- Features section: 100% Seguro, Saques Instantâneos, Bônus Generosos
- Header with discreet "Entrar" and "Cadastrar" buttons
- Footer with platform info and +18 responsible gaming notice
- Auto-redirects authenticated users to /dashboard via useEffect
- Dashboard moved from "/" to "/dashboard" route
- Sidebar navigation updated to link to /dashboard

**E2E Testing Validation (Completed)**
- Landing page loads and displays all sections correctly
- Admin login redirects to /dashboard
- Admin sidebar shows only admin menu items
- Admin dashboard hides user quick actions
- User registration with automatic welcome bonus
- Deposit succeeds without KYC requirement
- Withdrawal < R$100 succeeds without KYC
- Withdrawal >= R$100 blocked with correct KYC error message
- All admin pages (Users, Analytics, KYC) load real database data

## Previous Changes (October 17, 2025)

**Notification System Implementation**
- Schema: notification_templates, notifications, user_notification_preferences tables with enums (email/sms, pending/sent/failed)
- Storage: getUserNotificationPreferences, createUserNotificationPreferences, updateUserNotificationPreferences, getUserNotifications, createNotification, getNotificationTemplates
- API: GET/PUT /api/notifications/preferences (auto-creates defaults: email ON, SMS OFF, all events ON), GET /api/notifications
- Frontend: Preferences page with Email/SMS channel switches, phone number input, event type toggles (deposit, withdrawal, bet_win, kyc_status, bonus)
- Hook: use-notifications.tsx with queries and mutation for preferences management
- Navigation: Route /notifications added, sidebar link with Bell icon
- Architect-approved: Storage methods use correct Drizzle patterns, mutation awaits response.json(), React Query cache invalidation works correctly

**Analytics Dashboard Implementation**
- Backend: GET /api/admin/analytics (overview metrics), GET /api/admin/analytics/time-series?period=day|week|month, GET /api/admin/analytics/top-users?limit=10
- Frontend: Analytics page with 8 overview cards (users, revenue/GGR, bets, transactions, bonuses, fraud alerts, deposit/withdrawal volumes)
- Time series chart with period selector (daily/weekly/monthly) using recharts LineChart
- Top users table with limit selector (10/25/50) and ranking badges
- E2E tested and validated: all cards display correctly, chart updates on period change, table updates on limit change

**Bonus System Implementation**
- Created bonuses table with full schema (type, amount, wager_requirement, current_wager, status, code, description, expires_at)
- Implemented storage methods with proper authorization (fixed security bug using Drizzle and() for combined filters)
- Added API endpoints: GET /api/bonuses, POST /api/bonuses/apply-code, GET /api/admin/bonuses, POST /api/admin/bonuses
- Automatic R$50 welcome bonus on user registration with R$100 wager requirement
- Frontend UI for users: bonuses page with promo code application, active bonuses display, wager progress tracking
- Admin UI: promotion creation with code generation, expiration dates, rollover requirements
- Navigation links added to sidebar for both user and admin views
- E2E tested and validated: registration with welcome bonus, promo code application, admin promotion management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: Shadcn/ui with Radix UI primitives, providing accessible, customizable components following the "new-york" style variant. All components are co-located in `client/src/components/ui/`.

**Styling**: TailwindCSS with custom design tokens implementing a dark-first color scheme. The theme system supports both light and dark modes with CSS variables, though dark mode is the primary interface design. Color palette emphasizes trust (emerald green for money/success), casino premium feel (vibrant purple for accents), and clear financial indicators (green for profit, red for loss).

**State Management**: TanStack Query (React Query) for server state management with aggressive caching strategies (`staleTime: Infinity`, disabled window focus refetch). No local storage or session storage is used - all state persists in PostgreSQL.

**Routing**: Wouter for client-side routing with protected route implementation that checks authentication status before rendering.

**Real-time Updates**: WebSocket integration for live balance updates and transaction notifications. The WebSocket connection authenticates users and pushes updates that invalidate relevant React Query cache entries.

**Form Handling**: React Hook Form with Zod schema validation, integrated with Shadcn form components.

### Backend Architecture

**Runtime**: Node.js with Express.js framework, written in TypeScript.

**API Design**: RESTful API with endpoints organized by domain:
- `/api/auth/*` - Authentication (login, register, logout)
- `/api/wallet/*` - Balance queries
- `/api/transactions/*` - Deposits, withdrawals, transaction history
- `/api/bets/*` - Place bets, view betting history
- `/api/kyc/*` - KYC document upload and verification
- `/api/admin/*` - Administrative operations (users, KYC approval, platform stats)

**Authentication**: Passport.js with Local Strategy using bcrypt-style password hashing (scrypt with salt). Session-based authentication with express-session, storing sessions in PostgreSQL via connect-pg-simple. JWT tokens are referenced but primary auth mechanism is server-side sessions.

**WebSocket Server**: Integrated WebSocket server running on the same HTTP server as Express, handling authenticated real-time connections for balance updates.

**Error Handling**: Centralized error middleware that returns JSON responses with appropriate HTTP status codes.

### Data Storage Solutions

**Database**: PostgreSQL using Neon serverless driver over WebSocket connections.

**ORM**: Drizzle ORM with type-safe schema definitions in `shared/schema.ts`. The schema is shared between client and server for type consistency.

**Schema Design**:
- **users**: Core user data with balance, KYC status, role (user/admin), and Brazilian-specific fields (CPF tax ID)
- **kyc_documents**: Document storage with type (ID front/back, proof of address, selfie), status tracking, and admin review notes
- **transactions**: Complete financial audit trail with type (deposit/withdraw/bet_stake/bet_win/bonus), status, payment method, and metadata
- **bets**: Betting records with game type (casino/lottery/jogo_bicho), amounts, status, and game-specific data stored as JSONB
- **audit_logs**: System-wide audit trail for administrative actions

**Session Storage**: PostgreSQL table managed by connect-pg-simple, ensuring sessions persist across server restarts.

**Type Safety**: Drizzle-zod integration generates Zod schemas from database schema for runtime validation matching database constraints.

### Authentication and Authorization Mechanisms

**User Roles**: Enum-based role system (user, admin) stored in database.

**Password Security**: Scrypt-based hashing with random salt, using Node.js crypto module with timing-safe comparison to prevent timing attacks.

**Session Management**: HTTP-only cookies with 7-day expiration, secure flag in production. Sessions stored in PostgreSQL with automatic cleanup.

**Protected Routes**: Client-side route guards check authentication status and redirect to `/auth` if unauthenticated. Loading states prevent flash of unauthenticated content.

**Admin Authorization**: Middleware (`isAdmin`) verifies user role before allowing access to administrative endpoints. Admin UI routes also implement client-side role checking.

**KYC Gating**: Certain operations (large withdrawals, high-stakes betting) check KYC approval status before proceeding.

### External Dependencies

**Database Provider**: Neon (serverless PostgreSQL) accessed via `@neondatabase/serverless` with WebSocket support for edge/serverless environments.

**UI Components**: Radix UI primitives provide the foundation for all interactive components (dialogs, dropdowns, tooltips, etc.).

**Payment Processing**: Currently simulated/mocked, designed to integrate with:
- PIX (Brazilian instant payment system)
- Credit/debit card processors
- Cryptocurrency wallets

**KYC Verification**: Mock implementation ready for third-party KYC provider integration (document verification, identity checks).

**Object Storage**: File URLs stored in database, designed to integrate with S3-compatible storage for KYC documents and user uploads.

**WebSocket Communication**: Built-in Node.js `ws` library for real-time bidirectional communication.

**Development Tools**:
- Vite plugins for Replit integration (cartographer, dev banner, runtime error overlay)
- Drizzle Kit for database migrations
- ESBuild for production server bundling

**Font Delivery**: Google Fonts for Inter (primary), Geist Mono (financial data), Fira Code, DM Sans, and Architects Daughter.

**TypeScript Compilation**: Shared path aliases (`@/`, `@shared/`, `@assets/`) configured in both tsconfig and Vite for consistent imports across client and server.

**Monorepo Structure**: Single repository with `client/`, `server/`, and `shared/` directories. Build process bundles server with ESBuild and client with Vite, outputting to `dist/`.