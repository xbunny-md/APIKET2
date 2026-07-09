# NEXAPI HUB

A scalable SaaS architecture for a modern API marketplace.

## Phase 1.1.5 - Admin Control Center

This phase introduces a complete Admin Control Center, giving platform administrators full UI-based management over APIs, Providers, Users, and Plans. 

### Highlights
- **Direct Admin Access**: Open the admin panel seamlessly at `/admin/?areyouadmin`—no password required for this demonstration context.
- **API Builder**: Create and edit top-level APIs natively via the dashboard.
- **Endpoint Builder**: Inside every API, create unlimited endpoints specifying routes, methods, and descriptions.
- **Auto Documentation Generation**: Changes in the API Builder automatically translate into dynamic documentation and API Tester endpoints.
- **Provider Management**: Manage multiple backend providers (e.g. TikTok Scrapers, YouTube APIs). Enable/disable routing seamlessly and set priorities.
- **Plan Management**: Create unlimited subscription tiers with granular quotas (daily, weekly, monthly, requests-per-minute, max API keys, and projects).
- **User & API Key Management**: View and moderate all developers and their API keys on the platform.
- **Analytics Dashboard**: Get a high-level view of users, active API keys, total APIs, and today's requests directly from MongoDB.
- **System Settings**: Configure site-wide settings directly.

## Previous Phases
- **Phase 1.1.4**: Mobile UX, Real Data & API Testing.
- **Phase 1.1.3**: Authentication, UX, and Dashboard Completion.

## System Architecture

NEXAPI is built on a full-stack Next.js-inspired Express + Vite + React foundation.

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Framer Motion** for animations
- **Recharts** for analytics
- **React Router** for routing

### Backend
- **Express.js** API Gateway and Management layer
- **Mongoose / MongoDB** for robust document storage
- **JWT** for stateless secure sessions and API key validation

### Core Features
- API Key generation, validation, and revoking
- Global Rate Limiting
- Usage Analytics and Request Logging
- Provider Management Engine for graceful degradation and multi-source API integration
- Secure Administrator Portal

## Setup & Deployment

1. Set `MONGODB_URI` to a valid MongoDB connection string.
2. Set `JWT_SECRET` to a secure random string.
3. Start the dev server: `npm run dev`
4. The system will automatically seed the initial database schema on first boot.

## Admin Panel Access

The administrative panel uses a direct query parameter access system.
Simply navigate to: `/admin/?areyouadmin`
