# Design Guidelines: Casino & Betting Platform

## Design Approach

**Hybrid Approach**: Material Design system foundation + casino industry aesthetics inspired by modern betting platforms (Stake, Bet365, DraftKings). Prioritizes trust, professionalism, and clear financial data presentation while maintaining an engaging casino atmosphere.

**Core Principles**:
- Trust through transparency (clear balances, transaction history, status indicators)
- Professional financial interface with casino excitement
- Dark-first design (industry standard for betting platforms)
- Real-time feedback for all financial operations

## Color Palette

**Dark Mode (Primary)**:
- Background Primary: 220 15% 8% (deep navy-black)
- Background Secondary: 220 15% 12% (elevated surfaces)
- Background Tertiary: 220 15% 16% (cards, inputs)
- Text Primary: 220 10% 95%
- Text Secondary: 220 8% 70%

**Brand Colors**:
- Primary (CTAs, success states): 160 84% 45% (emerald green - trust/money)
- Accent (highlights, active states): 270 70% 60% (vibrant purple - casino premium feel)
- Warning (pending states): 38 92% 50% (amber)
- Danger (errors, losses): 0 72% 55% (red)

**Financial Indicators**:
- Profit/Win: 142 71% 45% (green)
- Loss/Debit: 0 72% 55% (red)
- Neutral/Pending: 220 10% 60% (gray)

## Typography

**Font Stack**:
- Primary: Inter (via Google Fonts) - clean, professional, excellent readability
- Monospace: JetBrains Mono - for financial values, bet IDs, transaction codes

**Hierarchy**:
- Headings: font-bold, tracking-tight
- Body: font-normal, leading-relaxed
- Financial Data: font-mono, tabular-nums for alignment
- CTAs: font-semibold, uppercase tracking-wide for buttons

**Sizes**:
- Hero/Page Titles: text-4xl lg:text-5xl
- Section Headers: text-2xl lg:text-3xl
- Card Titles: text-lg font-semibold
- Body Text: text-base
- Financial Values: text-xl lg:text-2xl font-mono
- Small/Meta: text-sm text-muted-foreground

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-4 to p-8
- Section gaps: gap-6 to gap-8
- Page margins: px-4 lg:px-8
- Card spacing: p-6

**Grid Structure**:
- Dashboard: Two-column on desktop (sidebar + main), single column mobile
- Admin Tables: Full-width responsive tables with horizontal scroll
- Transaction History: Single column list with expandable details
- Betting Area: Fluid grid adapting to game integration requirements

## Component Library

### Authentication Screens
- Split layout: Left side branding/visuals (40%), right side form (60%)
- Form cards: glass-morphism effect (bg-background/80 backdrop-blur)
- Input fields: Dark with subtle borders, focus states with primary color glow
- Social login: Icon buttons with platform colors
- Trust indicators: SSL badge, license info in footer

### User Dashboard
- **Header**: Balance display (large, prominent), user profile, notifications bell
- **Quick Actions**: Deposit/Withdraw buttons (primary CTA styling), transaction history link
- **Stats Cards**: Grid of 3-4 cards showing: Available Balance, Pending Bets, Total Wins/Losses, Bonus Balance
- **Recent Activity**: List with icons, amounts (color-coded), timestamps
- **KYC Status Banner**: Prominent when verification needed (warning color, action button)

### Betting Area (API Integration Ready)
- **Game Cards**: Image placeholder, game name, provider logo space
- **Betting Interface**: Clean form with amount input, bet type selectors, confirm button
- **Live Feed**: WebSocket connected list showing recent bets/wins (scrolling ticker style)
- **Balance Display**: Sticky header showing real-time balance updates

### KYC Verification Flow
- **Progress Steps**: 4-step indicator (Document Type → Upload → Review → Approved)
- **Upload Interface**: Drag-and-drop zone, file preview, requirements checklist
- **Status Cards**: Visual indicators (pending/approved/rejected) with icons
- **Document Display**: Grid layout for uploaded documents with status badges

### Admin Panel
- **Sidebar Navigation**: Collapsed on mobile, permanent on desktop, icon + label
- **Data Tables**: Shadcn Table with sorting, filtering, pagination, row actions
- **User Management**: Cards with avatar, key metrics, action dropdowns
- **KYC Queue**: Prioritized list with document viewer modal
- **Transaction Monitor**: Real-time feed with amount highlights, filter controls
- **Dashboard Stats**: Large number displays with trend indicators (↑↓), sparkline charts

### Transaction Components
- **Deposit/Withdraw Modals**: Step-by-step flow, payment method cards, amount input with presets
- **Transaction Cards**: Left-aligned icon, type/description, right-aligned amount (color-coded)
- **History Table**: Filterable by type/date, export button, expandable rows for details
- **Receipt View**: Formatted transaction details, ID, timestamp, payment method

## Interactions & States

**Button States** (using Shadcn defaults):
- Primary: bg-primary hover:bg-primary/90
- Outline on images: backdrop-blur-md bg-background/10 border-white/20 (no custom hover - Shadcn handles it)
- Loading: Spinner icon, disabled state

**Form Inputs**:
- Default: border-muted focus:border-primary focus:ring-primary/20
- Error: border-destructive with error message below
- Success: border-green with checkmark icon
- Disabled: opacity-50 cursor-not-allowed

**Real-time Updates**:
- Balance changes: Subtle scale animation (animate-pulse once)
- New transactions: Slide-in from top with fade
- Bet results: Color flash (green/red) on resolution
- WebSocket status: Connection indicator (dot with pulse animation)

**Loading States**:
- Skeleton screens for initial data load
- Spinner overlays for actions (deposits, bets)
- Optimistic UI updates with rollback on error

## Visual Enhancements

**Cards & Surfaces**:
- Elevation: Use subtle borders (border-border) vs shadows for dark mode
- Glass effect for modals: backdrop-blur-xl bg-background/95
- Hover states: brightness increase, border color change

**Icons**:
- Use Lucide React (via Shadcn) for consistency
- Financial icons: dollar-sign, trending-up, trending-down, wallet
- Status icons: check-circle, alert-circle, clock
- Size: Standard icons at 20px (h-5 w-5), hero icons at 24px

**Badges & Status**:
- KYC Status: Rounded pills with dot indicator
- Transaction Type: Minimal badges with type-specific colors
- Bet Status: Bold text with background color (pending/won/lost)

## Images

**Hero Section** (Landing/Marketing Page if created):
- Full-width hero image: Casino atmosphere (roulette wheel, cards, chips) with dark overlay
- Gradient overlay: from-background/90 to-background/60
- CTA buttons with backdrop-blur on image

**Dashboard/App Sections**:
- No large hero images in authenticated areas
- Small illustrative icons/graphics for empty states
- Profile avatars: Circular, with fallback initials
- Document thumbnails: 16:9 aspect ratio previews in KYC section

**Trust Elements**:
- Payment provider logos in footer (Visa, Mastercard, PIX)
- SSL/Security badges near sensitive forms
- License/regulation mentions with official seals (if applicable)

## Responsive Breakpoints

- Mobile: Single column, collapsible nav, stacked cards
- Tablet (md): Two-column dashboard, visible sidebar
- Desktop (lg): Full multi-column layouts, expanded tables
- Balance display: Always prominent regardless of viewport