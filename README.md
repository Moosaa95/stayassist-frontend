# StayAssist Frontend

A modern Next.js application for browsing and booking rental properties.

## Tech Stack

### Core Framework
- **Next.js 16.0.4** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe JavaScript

### State Management
- **Redux Toolkit 2.11.0** - State management with RTK Query for API caching
- **React Redux 9.2.0** - React bindings for Redux
- **async-mutex 0.5.0** - Mutex for preventing race conditions in token refresh

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless UI components (Dialog, Label, Slider, Slot)
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class name utilities
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **Babel React Compiler** - Optimizing React compilation

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Navigate to the frontend directory:
```bash
cd stayassist-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_HOST=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_HOST=https://your-backend-domain.com
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

5. Build for production:
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
stayassist-frontend/
├── app/
│   ├── (auth)/              # Authentication pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (stayassist)/        # Protected routes
│   │   ├── listing/         # Property listings
│   │   │   ├── [id]/        # Individual listing detail
│   │   │   └── page.tsx     # Listings page
│   │   └── layout.tsx       # Layout with RequireAuth
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── auth/                # Authentication components
│   │   ├── RequireAuth.tsx  # Protected route wrapper
│   │   └── RequireGuest.tsx # Guest-only route wrapper
│   ├── listings/            # Listing components
│   └── ui/                  # Reusable UI components
├── states/
│   ├── features/
│   │   ├── endpoints/       # RTK Query API endpoints
│   │   │   ├── auth/
│   │   │   └── listings/
│   │   └── slices/          # Redux slices
│   │       └── auth/
│   ├── services/
│   │   └── apiSlice.ts      # Base API configuration
│   ├── stores.ts            # Redux store configuration
│   └── provider.tsx         # Redux provider with auth initialization
├── lib/                     # Utility functions
└── public/                  # Static assets
```

## Architecture Decisions

### 1. App Router over Pages Router
- Using Next.js 15+ App Router for better performance and RSC support
- Cleaner file-based routing with layout composition
- Better loading states and error handling

### 2. Route Organization
- **(auth)** route group: Login and registration pages for unauthenticated users
- **(stayassist)** route group: Protected pages requiring authentication
- Route groups don't affect URL structure but allow layout organization

### 3. Authentication Strategy
- **Cookie-based JWT authentication** with httpOnly cookies for security
- **Automatic token refresh** using RTK Query middleware with mutex to prevent race conditions
- **Client-side auth state** synced with localStorage for persistence across refreshes
- **Route guards** (RequireAuth, RequireGuest) for protecting routes

### 4. State Management
- **RTK Query** for server state management with automatic caching and revalidation
- **Redux Toolkit** for global client state (authentication)
- Centralized API configuration with automatic CSRF token handling

### 5. API Integration
- Base query with automatic token refresh on 401 responses
- CSRF token extraction from cookies for Django backend compatibility
- Credentials included in all requests for cookie-based auth

### 6. Component Architecture
- Shadcn/ui pattern: Reusable, accessible components built on Radix UI
- Server components by default, client components only when needed
- Composition over configuration for flexibility

## Known Limitations

### Authentication & Security
1. **No Remember Me functionality** - Refresh tokens expire after 1 day
2. **No multi-device session management** - Cannot view or revoke sessions from other devices
3. **Limited password recovery** - Basic email-based password reset without rate limiting or multi-factor authentication
4. **Auth state not persisted in cookies** - Uses localStorage which is vulnerable to XSS (tokens are in httpOnly cookies though)
5. **No automatic logout on token expiration** - User must manually refresh or logout when refresh token expires

### State Management
6. **No offline support** - Application requires constant network connection
7. **No optimistic updates** - All mutations wait for server response before updating UI
8. **Cache invalidation is manual** - Must explicitly invalidate RTK Query cache tags
9. **Auth state race condition risk** - Multiple tabs might conflict on login/logout

### User Experience
10. **No loading skeletons** - Uses basic loading spinners instead of content-aware skeletons
11. **No pagination** - All listings loaded at once (performance issue with many listings)
12. **No infinite scroll** - Listing page loads all results upfront
13. **Client-side filtering only** - City and price filters don't reduce API payload
14. **No search debouncing** - City filter triggers re-render on every keystroke
15. **No image optimization for listings** - All images loaded at full resolution
16. **No error boundaries** - Unhandled errors can crash the entire app

### Features
17. **No user profile page** - Cannot view or edit user information after registration
18. **No booking history** - Cannot view past or upcoming bookings
19. **No favorites/wishlist** - Cannot save listings for later
20. **No reviews or ratings** - Cannot see or leave property reviews
21. **No property comparison** - Cannot compare multiple listings side-by-side
22. **No map view** - Listings only available in grid view
23. **No advanced filters** - Missing amenities, property type, guest count filters
24. **No sorting options** - Cannot sort by price, rating, or date

### Accessibility
25. **Limited keyboard navigation** - Some interactive elements lack focus indicators
26. **No ARIA labels on filter controls** - Screen reader support incomplete
27. **Color contrast issues** - Some text might not meet WCAG AA standards

### Performance
28. **No code splitting by route** - Entire app bundle loaded upfront
29. **No image lazy loading** - All listing images load immediately
30. **No service worker** - No PWA capabilities or offline fallback
31. **Bundle size not optimized** - No tree shaking analysis performed

### Development
32. **No E2E tests** - Only manual testing performed
33. **No component tests** - No unit or integration tests
34. **No Storybook** - No component documentation or isolated development
35. **TypeScript not strict mode** - Some type safety compromised
36. **No API mocking** - Development depends on backend running

### Deployment
37. **Environment variables exposed** - NEXT_PUBLIC_ prefix exposes backend URL to client
38. **No CDN for static assets** - Images served directly from backend or Cloudinary
39. **No monitoring or error tracking** - No Sentry or similar integration
40. **No analytics** - No user behavior tracking

## Production Deployment

The frontend is deployed on Vercel:
- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard
- NEXT_PUBLIC_HOST points to production backend

### Environment Variables (Vercel)
```
NEXT_PUBLIC_HOST=https://your-backend-url.onrender.com
```

## Contributing

1. Create feature branches from `main`
2. Follow existing code structure and naming conventions
3. Ensure TypeScript types are properly defined
4. Test authentication flows thoroughly

## License

Proprietary
