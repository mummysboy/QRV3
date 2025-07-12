# QRewards Dashboard Investigation Findings

## Current State
The QRewards application currently only contains a **public-facing rewards claiming interface**. Users can scan QR codes and claim rewards, but there are no admin or advertiser dashboards in the current build.

## What's Missing

### 1. Admin Dashboard
- **Status**: ❌ Not implemented
- **Backend**: GraphQL schema exists for `Admin` model with the following fields:
  - `id: ID!`
  - `userId: String!`
  - `role: String!`
  - `createdAt: AWSDateTime!`
  - `updatedAt: AWSDateTime!`
  - `owner: String`
- **Required Features**:
  - Admin login/authentication
  - Card management (create, edit, delete reward cards)
  - Advertiser management (approve/reject, status updates)
  - Analytics dashboard (claimed rewards, usage statistics)
  - User management system

### 2. Advertiser Dashboard
- **Status**: ❌ Not implemented
- **Backend**: GraphQL schema exists for `Advertiser` model with the following fields:
  - `id: ID!`
  - `userId: String!`
  - `businessName: String!`
  - `businessAddress: String`
  - `businessPhone: String`
  - `businessLogo: String`
  - `status: AdvertiserStatus` (PENDING, APPROVED, REJECTED)
  - `createdAt: AWSDateTime!`
  - `updatedAt: AWSDateTime!`
  - `owner: String`
- **Required Features**:
  - Advertiser registration/onboarding
  - Advertiser login/authentication
  - Create and manage their own reward cards
  - View campaign analytics
  - Profile management
  - Status tracking (pending approval, approved, etc.)

## Current Application Structure
```
src/
├── app/
│   ├── page.tsx          # Main public rewards claiming interface
│   ├── layout.tsx        # Root layout
│   └── api/              # API routes
├── components/
│   ├── CardAnimation.tsx
│   ├── ClaimButton.tsx
│   ├── Header.tsx
│   ├── HamburgerMenu.tsx
│   ├── LogoVideo.tsx
│   ├── ThankYouOverlay.tsx
│   ├── Toast.tsx
│   └── Popups/          # Contact, reward claim popups
└── lib/
    └── supabaseClient.ts
```

## What Needs to be Implemented

### 1. Authentication System
- User role-based authentication (Admin, Advertiser, Public)
- Login/logout functionality
- Protected routes for dashboards
- Session management

### 2. Routing Structure
Recommended Next.js 13+ app directory structure:
```
src/app/
├── page.tsx                    # Public rewards interface
├── admin/
│   ├── page.tsx               # Admin dashboard
│   ├── cards/
│   │   ├── page.tsx          # Card management
│   │   └── [id]/
│   │       └── page.tsx      # Edit specific card
│   ├── advertisers/
│   │   └── page.tsx          # Advertiser management
│   └── analytics/
│       └── page.tsx          # Analytics dashboard
├── advertiser/
│   ├── page.tsx               # Advertiser dashboard
│   ├── cards/
│   │   ├── page.tsx          # My cards
│   │   └── create/
│   │       └── page.tsx      # Create new card
│   ├── analytics/
│   │   └── page.tsx          # My analytics
│   └── profile/
│       └── page.tsx          # Profile management
└── auth/
    ├── login/
    │   └── page.tsx          # Login page
    └── register/
        └── page.tsx          # Registration page
```

### 3. Required Components
- Dashboard layouts
- Data tables for managing cards/advertisers
- Forms for creating/editing cards
- Analytics charts and visualizations
- User profile management components
- Navigation menus for different user roles

### 4. API Integration
- AWS Amplify GraphQL API integration
- CRUD operations for Admin and Advertiser models
- File upload handling for business logos
- Authentication with AWS Cognito

## Recommendations

1. **Start with Authentication**: Implement AWS Cognito user pools with role-based access
2. **Create Basic Dashboard Layouts**: Build the shell of both admin and advertiser dashboards
3. **Implement Card Management**: Allow admins to create/edit cards, advertisers to manage their own
4. **Add Analytics**: Build reporting dashboards for both user types
5. **User Experience**: Ensure smooth transitions between public interface and dashboards

## Technical Stack Needed
- **Authentication**: AWS Cognito User Pools
- **State Management**: React Context or Zustand
- **UI Components**: Tailwind CSS (already in use) + shadcn/ui or similar
- **Forms**: React Hook Form + Zod validation
- **Charts**: Chart.js or Recharts for analytics
- **Data Tables**: TanStack Table or similar

## Next Steps
1. Set up AWS Cognito authentication
2. Create protected route middleware
3. Build admin dashboard MVP
4. Build advertiser dashboard MVP
5. Implement card management functionality
6. Add analytics and reporting features