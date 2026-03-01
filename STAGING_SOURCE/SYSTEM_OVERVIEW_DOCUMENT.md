# 📘 Eventrix — Complete System Overview Document

> **Course:** IT3040 – ITPM | **BSc (Hons) IT, Year 3, Semester 1**  
> **System:** Eventrix — University Event Management Platform  
> **Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
> **Team Size:** 3 Members  
> **Date:** April 2026

---

## 📊 Table of Contents

1. [System Overview & Statistics](#1-system-overview--statistics)
2. [All Features in the System](#2-all-features-in-the-system)
3. [All CRUD Operations](#3-all-crud-operations)
4. [All UI Pages with URL Links](#4-all-ui-pages-with-url-links)
5. [Detailed User Journey — Student](#5-detailed-user-journey--student-role)
6. [Detailed User Journey — Organizer](#6-detailed-user-journey--organizer-role)
7. [Detailed User Journey — Admin](#7-detailed-user-journey--admin-role)
8. [QR Code System — Dedicated User Flow](#8-qr-code-system--dedicated-user-flow)
9. [Certificate Download — Dedicated User Flow](#9-certificate-download--dedicated-user-flow)

---

## 1. System Overview & Statistics

Eventrix is a full-stack university event management platform that enables **students** to discover, register for, and engage with campus events, **organizers** to create and manage events end-to-end, and **administrators** to govern the entire system. The platform is built on the MERN stack with JWT-based authentication, role-based access control, and Cloudinary-powered image hosting.

### Application Statistics

| Metric | Count |
|--------|-------|
| Backend Models | 10 (User, Event, Registration, Category, Notification, EventInteraction, Session, Survey, Announcement, Review) |
| Backend Controllers | 11 |
| Backend Route Files | 11 |
| Frontend Pages | 31+ |
| Frontend Components | 12+ reusable components |
| API Endpoints | ~65 |
| User Roles | 3 (Student, Organizer, Admin) |
| Database | MongoDB (via Mongoose ODM) |
| Authentication | JWT + Google OAuth 2.0 |
| Image Hosting | Cloudinary |
| Real-time Notifications | Polling-based (30s interval) |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│  │  Pages   │  │Components│  │  Services  │             │
│  │ (31+)    │  │ (12+)    │  │  (api.js)  │             │
│  └──────────┘  └──────────┘  └───────────┘             │
│         │              │             │                   │
│         └──────────────┴─────────────┘                   │
│                        │ Axios HTTP                      │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)            │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐         │
│  │  Routes  │→ │Controllers │→ │   Models    │         │
│  │  (11)    │  │   (11)     │  │   (10)      │         │
│  └──────────┘  └────────────┘  └─────────────┘         │
│  ┌──────────────────────────────────────────┐           │
│  │  Middleware: JWT Auth, RBAC, Validation,  │           │
│  │  Rate Limiting, CORS, Helmet, Multer      │           │
│  └──────────────────────────────────────────┘           │
└────────────────────────┼────────────────────────────────┘
                         │ Mongoose
                         ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)                    │
│  Collections: users, events, registrations, categories, │
│  notifications, eventinteractions, sessions, surveys,   │
│  announcements, reviews                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. All Features in the System

### Feature 1: Authentication & User Management
- Email/password registration with role selection (Student / Organizer)
- Login with JWT token-based session management
- Google OAuth 2.0 integration (one-click sign-in)
- Forgot Password flow (email token-based)
- Reset Password with secure token validation
- Profile management (edit avatar via Cloudinary, bio, name, email)
- Change password (with current password verification)
- Public user profile (view other users' profiles)
- Session persistence with auto-refresh token
- Account deletion with password confirmation

### Feature 2: Event Management
- Create events with rich details (title, description, cover image via Cloudinary, venue, speakers, agenda, FAQs, tags)
- Faculty assignment: Business, IT, Engineering, Hospitality, All
- Category assignment (dynamic categories managed by admin)
- Event types: In-Person, Virtual, Hybrid
- Event status lifecycle: Draft → Published → Cancelled
- Edit and update events (organizer/owner only)
- Delete events permanently (with confirmation)
- Cancel events with reason
- Featured events listing on homepage
- Save/unsave events (bookmark functionality)
- Event search with advanced filters (faculty, category, type, date range, free/paid, keyword)
- Grid and list view toggle for event browsing
- View count tracking (auto-increments on page visit)
- Calendar export (ICS file download)

### Feature 3: Social Feed & Discovery
- Main social feed page after login with scrollable event cards
- Faculty tabs: All, Business 💼, IT 💻, Engineering ⚙️, Hospitality 🏨
- Category chips for quick filtering
- Like events (❤️ toggle with count)
- Mark as Interested / Going (with counts visible to all)
- Emoji reactions: 👏 🔥 ❤️ 😍 🎉 💡
- View counter on events
- Share event (native share API / clipboard copy)
- Calendar export from feed cards
- Pagination for feed

### Feature 4: Registration & Ticketing
- Event registration with capacity check and waitlist support
- Registration status tracking: Pending → Confirmed → Attended → Cancelled → Waitlisted
- Manual organizer approval (Confirm button for pending registrations)
- Cancel registration (student-initiated)
- Payment simulation (credit card form with card number formatting)
- QR Code digital E-ticket (modal with QR code encoding registration ID)
- Text-based E-ticket download (with event details, registration number, QR data)
- Attendee check-in via manual button (organizer)
- Attendee check-in via QR scanner (organizer scans student's QR)
- Registration number auto-generation
- Certificate of participation download (PDF with official template)
- Certificate issuance tracking (one-time download lock)

### Feature 5: Pre-Event Engagement
- **Countdown Timer** — Live countdown (Days : Hours : Minutes : Seconds) on event detail page sidebar
- **Sessions** — Full CRUD management by organizers; students can add sessions to personal schedule
- **Surveys** — Multi-question surveys with question types: text, radio, checkbox; students fill responses; organizers view aggregated results
- **Announcements** — Priority-based messages (high/medium/low) with color-coded display

### Feature 6: Schedule Planner
- View all registered events in a unified personal schedule
- View all sessions added to personal schedule
- Remove sessions from personal schedule
- Consolidated view of upcoming commitments

### Feature 7: Feedback & Reviews
- Star rating (1–5 stars) + text comment
- Inline feedback form within My Registrations (appears only for "attended" events)
- Average rating display on event detail page
- Review count shown alongside rating

### Feature 8: Notifications
- In-app notification system triggered by key events
- Unread count badge in navbar (polling every 30 seconds)
- Mark individual notifications as read
- Mark all notifications as read (bulk action)
- Delete individual notifications
- Paginated notification list

### Feature 9: Admin Panel
- Admin dashboard with system-wide statistics and charts
- Manage users: view all users, search/filter, update roles, create organizer accounts, delete organizer accounts
- Manage categories: full CRUD for event categories
- System-wide analytics: user counts, event counts, registration trends

### Feature 10: Role-Based Dashboards
- **Student Dashboard** — Registration stats, upcoming registered events, saved events count, quick-access links
- **Organizer Dashboard** — Created events stats, total registrations, registration trend chart (Recharts area chart), popular events table, recent registrations, revenue tracking, event status summary, "Create New Event" shortcut
- **Admin Dashboard** — System-wide metrics, user distribution, event analytics, registration overview charts

---

## 3. All CRUD Operations

### 3.1 Authentication CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Register | POST | `/api/auth/register` | Register.js (`/register`) | Public |
| 2 | Login | POST | `/api/auth/login` | Login.js (`/login`) | Public |
| 3 | Google OAuth | POST | `/api/auth/google` | Login.js (Google button) | Public |
| 4 | Logout | POST | `/api/auth/logout` | Navbar.js (dropdown) | Logged-in |
| 5 | Get Current User | GET | `/api/auth/me` | AuthContext.js (background) | Logged-in |
| 6 | Forgot Password | POST | `/api/auth/forgot-password` | ForgotPassword.js (`/forgot-password`) | Public |
| 7 | Reset Password | PUT | `/api/auth/reset-password/:token` | ResetPassword.js (`/reset-password/:token`) | Public |
| 8 | Refresh Token | POST | `/api/auth/refresh-token` | AuthContext.js (auto) | Logged-in |
| 9 | Google Callback | GET | `/api/auth/google/callback` | GoogleCallback.js | Public |

### 3.2 Events CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Create Event | POST | `/api/events` | CreateEvent.js (`/events/create`) | Organizer, Admin |
| 2 | Get All Events | GET | `/api/events` | EventList.js (`/events`) | Public |
| 3 | Get Feed Events | GET | `/api/events/feed` | SocialFeed.js (`/feed`) | Public |
| 4 | Get Featured Events | GET | `/api/events/featured` | Home.js (`/`) | Public |
| 5 | Get Single Event | GET | `/api/events/:id` | EventDetail.js (`/events/:id`) | Public |
| 6 | Update Event | PUT | `/api/events/:id` | EditEvent.js (`/events/:id/edit`) | Organizer (owner), Admin |
| 7 | Delete Event | DELETE | `/api/events/:id` | MyEvents.js (`/my-events`) | Organizer (owner), Admin |
| 8 | Cancel Event | PATCH | `/api/events/:id/cancel` | MyEvents.js (`/my-events`) | Organizer (owner), Admin |
| 9 | Get My Events | GET | `/api/events/user/my-events` | MyEvents.js (`/my-events`) | Organizer, Admin |
| 10 | Toggle Save | PATCH | `/api/events/:id/save` | EventDetail.js (`/events/:id`) | Logged-in |
| 11 | Get Saved Events | GET | `/api/events/user/saved` | SavedEvents.js (`/saved-events`) | Logged-in |
| 12 | Export Calendar | GET | `/api/events/:id/calendar` | EventDetail.js (button) | Public |

### 3.3 Registrations CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Register for Event | POST | `/api/registrations/:eventId` | EventDetail.js (`/events/:id`) | Logged-in |
| 2 | Get My Registrations | GET | `/api/registrations/my-registrations` | MyRegistrations.js (`/my-registrations`) | Logged-in |
| 3 | Get Event Registrations | GET | `/api/registrations/event/:eventId` | EventRegistrations.js (`/events/:eventId/registrations`) | Organizer, Admin |
| 4 | Confirm Registration | PATCH | `/api/registrations/:id/confirm` | EventRegistrations.js | Organizer, Admin |
| 5 | Check-In Attendee | PATCH | `/api/registrations/:id/check-in` | EventRegistrations.js (button + QR scan) | Organizer, Admin |
| 6 | Cancel Registration | PATCH | `/api/registrations/:id/cancel` | MyRegistrations.js (`/my-registrations`) | Student (own) |
| 7 | Submit Feedback | POST | `/api/registrations/:id/feedback` | MyRegistrations.js (inline form) | Student (attended) |
| 8 | Generate E-Ticket | GET | `/api/registrations/:id/e-ticket` | MyRegistrations.js (download) | Student (own) |
| 9 | Simulate Payment | POST | `/api/registrations/:id/payment` | PaymentSimulation.js (`/payment/:id`) | Student |
| 10 | Issue Certificate | PATCH | `/api/registrations/:id/issue-certificate` | MyRegistrations.js (download) | Student (attended) |
| 11 | Get Event Feedback | GET | `/api/registrations/event/:eventId/feedback` | EventDetail.js | Public |

### 3.4 Sessions CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Create Session | POST | `/api/sessions/:eventId` | ManageSessions.js (`/events/:eventId/sessions`) | Organizer, Admin |
| 2 | Get All Sessions | GET | `/api/sessions/:eventId` | ManageSessions.js | Public |
| 3 | Get Single Session | GET | `/api/sessions/detail/:id` | ManageSessions.js | Public |
| 4 | Update Session | PUT | `/api/sessions/detail/:id` | ManageSessions.js | Organizer, Admin |
| 5 | Delete Session | DELETE | `/api/sessions/detail/:id` | ManageSessions.js | Organizer, Admin |
| 6 | Add to Schedule | POST | `/api/sessions/detail/:id/schedule` | ManageSessions.js | Logged-in |
| 7 | Remove from Schedule | DELETE | `/api/sessions/detail/:id/schedule` | SchedulePlanner.js (`/schedule`) | Logged-in |
| 8 | Get My Schedule | GET | `/api/sessions/my-schedule` | SchedulePlanner.js | Logged-in |

### 3.5 Surveys CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Create Survey | POST | `/api/surveys/:eventId` | SurveyPage.js (`/events/:eventId/surveys`) | Organizer, Admin |
| 2 | Get All Surveys | GET | `/api/surveys/:eventId` | SurveyPage.js | Public |
| 3 | Get Single Survey | GET | `/api/surveys/detail/:id` | SurveyPage.js | Public |
| 4 | Submit Response | POST | `/api/surveys/detail/:id/respond` | SurveyPage.js | Logged-in |
| 5 | Get Results | GET | `/api/surveys/detail/:id/results` | SurveyPage.js | Organizer, Admin |
| 6 | Delete Survey | DELETE | `/api/surveys/detail/:id` | SurveyPage.js | Organizer, Admin |

### 3.6 Announcements CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Create Announcement | POST | `/api/announcements/:eventId` | AnnouncementsPage.js (`/events/:eventId/announcements`) | Organizer, Admin |
| 2 | Get All Announcements | GET | `/api/announcements/:eventId` | AnnouncementsPage.js | Public |
| 3 | Delete Announcement | DELETE | `/api/announcements/detail/:id` | AnnouncementsPage.js | Organizer, Admin |

### 3.7 Categories CRUD (Admin)

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Create Category | POST | `/api/categories` | ManageCategories.js (`/admin/categories`) | Admin |
| 2 | Get All Categories | GET | `/api/categories` | Multiple pages (filters) | Public |
| 3 | Get Category by ID | GET | `/api/categories/:id` | — | Public |
| 4 | Update Category | PUT | `/api/categories/:id` | ManageCategories.js | Admin |
| 5 | Delete Category | DELETE | `/api/categories/:id` | ManageCategories.js | Admin |

### 3.8 Users CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Get Own Profile | GET | `/api/users/profile` | Profile.js (`/profile`) | Logged-in |
| 2 | Update Profile | PUT | `/api/users/profile` | EditProfile.js (`/profile/edit`) | Logged-in |
| 3 | Change Password | PUT | `/api/users/change-password` | ChangePassword.js (`/profile/change-password`) | Logged-in |
| 4 | Delete Account | DELETE | `/api/users/account` | Profile.js | Logged-in |
| 5 | Get Public Profile | GET | `/api/users/:id` | UserPublicProfile.js (`/users/:id`) | Public |
| 6 | Get All Users | GET | `/api/users` | ManageUsers.js (`/admin/users`) | Admin |
| 7 | Update User Role | PATCH | `/api/users/:id/role` | ManageUsers.js | Admin |
| 8 | Create Organizer | POST | `/api/users/organizers` | ManageUsers.js | Admin |
| 9 | Delete Organizer | DELETE | `/api/users/:id/organizer` | ManageUsers.js | Admin |

### 3.9 Event Interactions CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Get Event Interactions | GET | `/api/interactions/:eventId` | FeedEventCard.js | Public |
| 2 | Toggle Like | POST | `/api/interactions/:eventId/like` | FeedEventCard.js | Logged-in |
| 3 | Toggle Interested | POST | `/api/interactions/:eventId/interested` | FeedEventCard.js | Logged-in |
| 4 | Toggle Going | POST | `/api/interactions/:eventId/going` | FeedEventCard.js | Logged-in |
| 5 | Add Reaction | POST | `/api/interactions/:eventId/reaction` | FeedEventCard.js | Logged-in |
| 6 | Remove Reaction | DELETE | `/api/interactions/:eventId/reaction` | FeedEventCard.js | Logged-in |

### 3.10 Notifications CRUD

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Get All Notifications | GET | `/api/notifications` | Notifications.js (`/notifications`) | Logged-in |
| 2 | Get Unread Count | GET | `/api/notifications/unread-count` | Navbar.js (badge) | Logged-in |
| 3 | Mark As Read | PATCH | `/api/notifications/:id/read` | Notifications.js | Logged-in |
| 4 | Mark All As Read | PATCH | `/api/notifications/read-all` | Notifications.js | Logged-in |
| 5 | Delete Notification | DELETE | `/api/notifications/:id` | Notifications.js | Logged-in |

### 3.11 Dashboard (Read-Only)

| # | Operation | HTTP Method | Backend Endpoint | Frontend Page | Access |
|---|-----------|-------------|-----------------|---------------|--------|
| 1 | Student Dashboard | GET | `/api/dashboard/user` | StudentDashboard.js (`/dashboard`) | Student |
| 2 | Organizer Dashboard | GET | `/api/dashboard/organizer` | OrganizerDashboard.js (`/organizer/dashboard`) | Organizer |
| 3 | Admin Dashboard | GET | `/api/dashboard/admin` | AdminDashboard.js (`/admin`) | Admin |

### CRUD Summary

| Module | Total Operations |
|--------|:---:|
| Authentication | 9 |
| Events | 12 |
| Registrations | 11 |
| Sessions | 8 |
| Surveys | 6 |
| Announcements | 3 |
| Categories | 5 |
| Users | 9 |
| Event Interactions | 6 |
| Notifications | 5 |
| Dashboards | 3 |
| **Grand Total** | **77** |

---

## 4. All UI Pages with URL Links

### 4.1 Public Pages (No Login Required)

| # | Page Name | URL Route | Source File | Description |
|---|-----------|-----------|-------------|-------------|
| 1 | Home Page | `/` | `pages/Home.js` | Landing page with hero section, featured events, category browsing, and CTA |
| 2 | Events List | `/events` | `pages/events/EventList.js` | Browse all events with search, filters (faculty, category, type, date, price), grid/list toggle |
| 3 | Event Detail | `/events/:id` | `pages/events/EventDetail.js` | Full event page: cover image, description, speakers, agenda, FAQs, countdown timer, sidebar with registration |
| 4 | Social Feed | `/feed` | `pages/feed/SocialFeed.js` | Instagram-style event feed with faculty tabs, category chips, like/interested/going/reactions |
| 5 | Login | `/login` | `pages/auth/Login.js` | Email/password login form + Google OAuth button |
| 6 | Register | `/register` | `pages/auth/Register.js` | Registration form with role selection (Student/Organizer) |
| 7 | Forgot Password | `/forgot-password` | `pages/auth/ForgotPassword.js` | Email input to receive password reset link |
| 8 | Reset Password | `/reset-password/:token` | `pages/auth/ResetPassword.js` | New password form via token link |
| 9 | Google Callback | `/auth/google/callback` | `pages/auth/GoogleCallback.js` | OAuth callback handler |
| 10 | Public User Profile | `/users/:id` | `pages/profile/UserPublicProfile.js` | View any user's public profile |
| 11 | Sessions (View) | `/events/:eventId/sessions` | `pages/sessions/ManageSessions.js` | View event sessions (CRUD shown to organizers only) |
| 12 | Surveys (View) | `/events/:eventId/surveys` | `pages/surveys/SurveyPage.js` | View/fill surveys (create/results for organizers only) |
| 13 | Announcements (View) | `/events/:eventId/announcements` | `pages/announcements/AnnouncementsPage.js` | View announcements (create/delete for organizers only) |

### 4.2 Student Pages (Login Required — role: `user`)

| # | Page Name | URL Route | Source File | Description |
|---|-----------|-----------|-------------|-------------|
| 14 | Student Dashboard | `/dashboard` | `pages/dashboard/StudentDashboard.js` | Registration stats, upcoming events, quick links |
| 15 | My Registrations | `/my-registrations` | `pages/registrations/MyRegistrations.js` | All registrations with tab filters, E-ticket, feedback, certificate download |
| 16 | Saved Events | `/saved-events` | `pages/events/SavedEvents.js` | Bookmarked/saved events list |
| 17 | Schedule Planner | `/schedule` | `pages/schedule/SchedulePlanner.js` | Personal schedule: registered events + added sessions |
| 18 | Payment Simulation | `/payment/:id` | `pages/registrations/PaymentSimulation.js` | Simulated credit card payment for paid events |
| 19 | My Profile | `/profile` | `pages/profile/Profile.js` | View own profile, avatar, bio, account deletion |
| 20 | Edit Profile | `/profile/edit` | `pages/profile/EditProfile.js` | Edit name, email, bio, avatar upload |
| 21 | Change Password | `/profile/change-password` | `pages/profile/ChangePassword.js` | Change password with current password verification |
| 22 | Notifications | `/notifications` | `pages/notifications/Notifications.js` | All notifications, mark read, delete |

### 4.3 Organizer Pages (Login Required — role: `organizer`)

| # | Page Name | URL Route | Source File | Description |
|---|-----------|-----------|-------------|-------------|
| 23 | Organizer Dashboard | `/organizer/dashboard` | `pages/dashboard/OrganizerDashboard.js` | Event stats, registration trends chart, popular events, revenue |
| 24 | Create Event | `/events/create` | `pages/events/CreateEvent.js` | Full event creation form: details, image, speakers, agenda, FAQs |
| 25 | Edit Event | `/events/:id/edit` | `pages/events/EditEvent.js` | Edit existing event with pre-filled form |
| 26 | My Events | `/my-events` | `pages/events/MyEvents.js` | List of organizer's own events with edit/delete/cancel actions |
| 27 | Event Registrations | `/events/:eventId/registrations` | `pages/registrations/EventRegistrations.js` | Registrations table with confirm, check-in, QR scanner, stats |

### 4.4 Admin Pages (Login Required — role: `admin`)

| # | Page Name | URL Route | Source File | Description |
|---|-----------|-----------|-------------|-------------|
| 28 | Admin Dashboard | `/admin` | `pages/admin/AdminDashboard.js` | System-wide stats, charts, user/event/registration analytics |
| 29 | Manage Users | `/admin/users` | `pages/admin/ManageUsers.js` | User table: search, filter, role change, create/delete organizer |
| 30 | Manage Categories | `/admin/categories` | `pages/admin/ManageCategories.js` | Category CRUD: create, edit, delete event categories |

### 4.5 Reusable Components

| # | Component | Source File | Used In |
|---|-----------|-------------|---------|
| 1 | Navbar | `components/layout/Navbar.js` | All pages — role-specific navigation, notification badge |
| 2 | Footer | `components/layout/Footer.js` | All pages |
| 3 | EventCard | `components/common/EventCard.js` | EventList, Home, SavedEvents |
| 4 | FeedEventCard | `components/common/FeedEventCard.js` | SocialFeed — with interactions |
| 5 | CountdownTimer | `components/common/CountdownTimer.js` | EventDetail sidebar |
| 6 | LoadingSpinner | `components/common/LoadingSpinner.js` | All pages — loading states |
| 7 | CertificateTemplate | `components/registrations/CertificateTemplate.js` | MyRegistrations — PDF generation |
| 8 | PrivateRoute | `components/common/PrivateRoute.js` | Route guard — any logged-in user |
| 9 | StudentRoute | `components/common/StudentRoute.js` | Route guard — student only |
| 10 | OrganizerRoute | `components/common/OrganizerRoute.js` | Route guard — organizer only |
| 11 | AdminRoute | `components/common/AdminRoute.js` | Route guard — admin only |

---

## 5. Detailed User Journey — Student Role

> **Role identifier:** `user` | **Landing page after login:** `/feed` (Social Feed)

### Phase 1: Account Creation & Authentication

```
Step 1.1 — REGISTER
├── Student navigates to: /register
├── Fills: First Name, Last Name, Email, Password, Confirm Password
├── Selects role: "Student"
├── Submits → POST /api/auth/register
├── Backend creates user with role='user', hashes password, returns JWT token
├── JWT stored in localStorage → user auto-redirected to /feed
└── Features used: Registration, JWT Auth, Role Selection

Step 1.2 — ALTERNATIVE: GOOGLE SIGN-IN
├── Student clicks "Continue with Google" on /login
├── Google OAuth popup → credential sent to POST /api/auth/google
├── Backend creates/fetches user, returns JWT
└── Redirected to /feed

Step 1.3 — FORGOT PASSWORD (if needed)
├── Student navigates to: /forgot-password
├── Enters email → POST /api/auth/forgot-password
├── Receives email with reset link containing token
├── Navigates to: /reset-password/:token
├── Enters new password → PUT /api/auth/reset-password/:token
└── Redirected to /login → logs in with new password
```

### Phase 2: Event Discovery & Social Engagement

```
Step 2.1 — SOCIAL FEED BROWSING
├── Student lands on: /feed (main page after login)
├── Sees scrollable event cards with cover images
├── Uses Faculty tabs to filter: All | Business 💼 | IT 💻 | Engineering ⚙️ | Hospitality 🏨
├── Uses Category chips for further filtering
├── Each card shows: title, date, venue, cover image, faculty badge
└── Features used: Social Feed, Faculty Filtering, Category Filtering

Step 2.2 — SOCIAL INTERACTIONS ON FEED
├── ❤️ Like: Clicks heart icon → POST /api/interactions/:eventId/like (toggles)
├── 🙋 Interested: Clicks "Interested" → POST /api/interactions/:eventId/interested
├── ✅ Going: Clicks "Going" → POST /api/interactions/:eventId/going
├── 😍 Reactions: Selects emoji (👏🔥❤️😍🎉💡) → POST /api/interactions/:eventId/reaction
├── 📤 Share: Clicks share → native share API or clipboard copy
├── All counts update in real-time on the card
└── Features used: Like, Interested, Going, Emoji Reactions, Share

Step 2.3 — EVENT LIST BROWSING (Alternative Discovery)
├── Student navigates to: /events
├── Uses Advanced Filters panel: faculty, category, event type, date range, free/paid, keyword search
├── Toggles between Grid View and List View
├── Clicks pagination to load more events
└── Features used: Event Search, Advanced Filters, Grid/List Toggle, Pagination

Step 2.4 — HOMEPAGE BROWSING
├── Student navigates to: / (Home)
├── Sees Hero section with CTA
├── Browses Featured Events section (GET /api/events/featured)
├── Browses categories
└── Features used: Featured Events, Homepage CTA
```

### Phase 3: Event Detail & Registration

```
Step 3.1 — VIEW EVENT DETAIL
├── Student clicks any event card → navigates to: /events/:id
├── Sees full event page:
│   ├── Cover image banner with back button
│   ├── Title, badges (category, event type, faculty)
│   ├── Organizer info with link to their public profile (/users/:id)
│   ├── "About This Event" description section
│   ├── Tags section
│   ├── Speakers grid (name, title, bio, image)
│   ├── Collapsible Agenda timeline
│   ├── Collapsible FAQs accordion
│   ├── Reviews section (average rating + count)
│   └── Event Resources links: Sessions, Announcements, Surveys, Add to Calendar
├── Sidebar shows:
│   ├── Date & Time
│   ├── Location (venue or "Online Event")
│   ├── Capacity bar (registered / total)
│   ├── Price (FREE or $XX.XX)
│   ├── 🔥 Countdown Timer (Days:Hours:Min:Sec) — if event is upcoming
│   ├── "Register Now" button (or "Already Registered" / "Event Full" / "Event Ended")
│   ├── Save/Bookmark button
│   └── Share button
├── View count auto-increments (backend tracks)
└── Features used: Event Detail, Countdown Timer, Speakers, Agenda, FAQs, Reviews, Calendar Export

Step 3.2 — REGISTER FOR EVENT
├── Student clicks "Register Now" on event detail sidebar
├── System checks: capacity, duplicate registration, event status
├── POST /api/registrations/:eventId
├── IF free event:
│   ├── Registration created with status 'pending' or 'confirmed'
│   ├── Toast: "Successfully registered!"
│   ├── Button changes to "Already Registered" with "View My Ticket" link
│   └── Notification generated for the student
├── IF paid event:
│   ├── Registration created → auto-redirect to: /payment/:registrationId
│   ├── Features used: Payment Simulation (see Step 3.3)
│   └── Registration marked as 'confirmed' after payment
├── IF event is full:
│   ├── Registration created with status 'waitlisted'
│   └── Student is notified if a spot opens up
└── Features used: Event Registration, Capacity Check, Waitlist

Step 3.3 — PAYMENT SIMULATION (Paid Events Only)
├── Student is redirected to: /payment/:registrationId
├── Sees payment form with:
│   ├── Event title and payment amount
│   ├── Credit card number input (with formatting)
│   ├── Expiry date and CVV fields
│   └── "Pay Now" button
├── Submits → POST /api/registrations/:id/payment
├── Backend simulates payment, updates paymentStatus to 'paid'
├── Toast: "Payment successful!"
├── Redirected to /my-registrations
└── Features used: Payment Simulation, Credit Card Form
```

### Phase 4: Pre-Event Engagement

```
Step 4.1 — VIEW & FILL SURVEYS
├── Student navigates from Event Detail → clicks "Surveys" link
├── Goes to: /events/:eventId/surveys
├── Sees list of active surveys created by the organizer
├── Clicks a survey → sees questions (text input, radio buttons, checkboxes)
├── Fills answers → POST /api/surveys/detail/:id/respond
├── Toast: "Response submitted!"
└── Features used: Survey Viewing, Survey Response Submission

Step 4.2 — READ ANNOUNCEMENTS
├── Student navigates from Event Detail → clicks "Announcements" link
├── Goes to: /events/:eventId/announcements
├── Sees announcements list with priority badges:
│   ├── 🔴 High priority (red)
│   ├── 🟡 Medium priority (yellow)
│   └── 🟢 Low priority (green)
├── Reads organizer messages about the event
└── Features used: Announcement Viewing, Priority Display

Step 4.3 — VIEW SESSIONS & ADD TO SCHEDULE
├── Student navigates from Event Detail → clicks "Sessions" link
├── Goes to: /events/:eventId/sessions
├── Sees list of sessions with: title, speaker info, time, location, capacity
├── Clicks "Add to Schedule" on desired sessions → POST /api/sessions/detail/:id/schedule
├── Toast: "Session added to your schedule!"
└── Features used: Session Viewing, Personal Schedule Management

Step 4.4 — CALENDAR EXPORT
├── Student clicks "Add to Calendar" on Event Detail page
├── Browser opens ICS file download
├── Student imports .ics file into Google Calendar / Outlook / Apple Calendar
└── Features used: Calendar Export (ICS)
```

### Phase 5: Ticket Management & Event Day

```
Step 5.1 — VIEW E-TICKET (QR CODE)
├── Student navigates to: /my-registrations
├── Finds confirmed registration → clicks "E-Ticket" button
├── QR code modal appears with:
│   ├── Event title
│   ├── QR code encoding the unique registration ObjectID
│   ├── "Show this QR code at the entrance" message
│   └── "Download Text Version" button (downloads .txt file)
├── Student shows QR code on their phone screen to the organizer at event entrance
└── Features used: QR Digital Ticket, QR Code Generation (qrcode.react)

Step 5.2 — DOWNLOAD TEXT TICKET
├── From QR modal → clicks "Download Text Version"
├── GET /api/registrations/:id/e-ticket
├── Downloads .txt file with: event name, date, venue, attendee name, registration #, QR data
└── Features used: E-Ticket Download
```

### Phase 6: Post-Event Activities

```
Step 6.1 — LEAVE FEEDBACK / REVIEW
├── After organizer marks student as "attended" (check-in)
├── Student navigates to: /my-registrations
├── Sees "Leave Review" button ONLY on registrations with status 'attended'
├── Clicks button → inline feedback form expands:
│   ├── Star rating (1-5): click star icons to rate
│   ├── Text comment: textarea for written feedback
│   ├── Submit button → POST /api/registrations/:id/feedback
│   └── Cancel button to close form
├── Toast: "Feedback submitted!"
├── Event's averageRating updates automatically
└── Features used: Star Rating, Feedback Form, Average Rating Calculation

Step 6.2 — DOWNLOAD CERTIFICATE OF PARTICIPATION
├── After status is 'attended'
├── Student sees "🎖️ Download Certificate" button on the registration card
├── Clicks button → system generates official PDF certificate:
│   ├── CertificateTemplate.js renders in background (off-screen)
│   ├── html2canvas captures the template as image
│   ├── jsPDF creates landscape PDF (1000x700px)
│   ├── Certificate includes: EVENTRIX branding, "CERTIFICATE OF PARTICIPATION" title
│   ├── Student's full name, event title, completion date
│   ├── Official signatures (Eventrix Council + Academic Board)
│   ├── Verified seal with registration number
│   └── PDF downloads as: Certificate-{registrationNumber}.pdf
├── PATCH /api/registrations/:id/issue-certificate → marks certificate as issued
├── Button changes to "🎖️ Certificate Issued" (greyed out, cannot download again)
├── Toast: "Certificate issued and downloaded!"
└── Features used: Certificate Generation, PDF Download, One-Time Issuance Lock
```

### Phase 7: Schedule & Profile Management

```
Step 7.1 — SCHEDULE PLANNER
├── Student navigates to: /schedule
├── Sees unified view of:
│   ├── All registered events with dates and venues
│   ├── All sessions added to personal schedule
│   └── Option to remove sessions from schedule
├── Uses this as a personal planner for upcoming commitments
└── Features used: Schedule Planner, Session Management

Step 7.2 — NOTIFICATIONS
├── Student sees bell icon with unread count badge in Navbar (polls every 30s)
├── Clicks bell → navigates to: /notifications
├── Sees notification list (registration confirmations, event updates, etc.)
├── Can: Mark individual as read, Mark All as Read, Delete notifications
└── Features used: In-App Notifications, Unread Count Badge

Step 7.3 — PROFILE MANAGEMENT
├── Student navigates to: /profile
├── Views profile: name, email, avatar, bio, registration count
├── Clicks "Edit Profile" → /profile/edit
│   ├── Updates: first name, last name, email, bio
│   ├── Uploads new avatar (Cloudinary)
│   └── Saves → PUT /api/users/profile
├── Clicks "Change Password" → /profile/change-password
│   ├── Enters: current password, new password, confirm new password
│   └── Saves → PUT /api/users/change-password
├── Clicks "Delete Account" → confirmation modal with password verification
│   └── DELETE /api/users/account → logged out, redirected to /
└── Features used: Profile View/Edit, Avatar Upload, Password Change, Account Deletion

Step 7.4 — SAVED EVENTS
├── Student navigates to: /saved-events
├── Sees list of all bookmarked events
├── Can click any event to go to its detail page
└── Features used: Saved/Bookmarked Events

Step 7.5 — VIEW OTHER USERS' PROFILES
├── Student clicks organizer name on Event Detail page
├── Navigates to: /users/:id
├── Sees public profile: name, avatar, bio, events created (for organizers)
└── Features used: Public User Profile

Step 7.6 — LOGOUT
├── Student clicks profile dropdown in Navbar → "Logout"
├── POST /api/auth/logout
├── JWT cleared from localStorage
├── Redirected to /
└── Features used: Logout, Session Clearing
```

---

## 6. Detailed User Journey — Organizer Role

> **Role identifier:** `organizer` | **Landing page after login:** `/feed` (Social Feed)

### Phase 1: Account Creation

```
Step 1.1 — REGISTER AS ORGANIZER
├── Organizer navigates to: /register
├── Fills: First Name, Last Name, Email, Password, Confirm Password
├── Selects role: "Organizer"
├── Submits → POST /api/auth/register
├── Backend creates user with role='organizer', returns JWT
├── Redirected to /feed
└── Features used: Registration, Role Selection

Step 1.2 — ALTERNATIVE: ADMIN CREATES ORGANIZER ACCOUNT
├── Admin creates organizer from: /admin/users
├── POST /api/users/organizers with name, email, password
├── Organizer receives credentials and logs in at /login
└── Features used: Admin Organizer Account Creation
```

### Phase 2: Event Creation & Management

```
Step 2.1 — CREATE A NEW EVENT
├── Organizer clicks "Create Event" in Navbar or Dashboard
├── Navigates to: /events/create
├── Fills comprehensive form:
│   ├── Basic Info: Title, Description (rich text)
│   ├── Cover Image upload (→ Cloudinary)
│   ├── Faculty: Business / IT / Engineering / Hospitality / All
│   ├── Category: dropdown from admin-created categories (GET /api/categories)
│   ├── Event Type: In-Person / Virtual / Hybrid
│   ├── Dates: Start Date/Time, End Date/Time
│   ├── Venue: Name, Address (for in-person/hybrid)
│   ├── Capacity: max attendees (number)
│   ├── Pricing: Free toggle or ticket price ($)
│   ├── Tags: comma-separated event tags
│   ├── Speakers: dynamic list → name, title, bio, image for each
│   ├── Agenda: dynamic timeline → time, title, description for each item
│   └── FAQs: dynamic list → question + answer pairs
├── Submits → POST /api/events (multipart/form-data for image)
├── Event created with status 'draft' or 'published'
├── Toast: "Event created successfully!"
├── Redirected to event detail page
└── Features used: Event Creation, Cloudinary Upload, Faculty/Category, Speakers, Agenda, FAQs

Step 2.2 — MANAGE MY EVENTS
├── Organizer navigates to: /my-events
├── Sees list of all their created events with status badges
├── For each event, can:
│   ├── Click to view event detail
│   ├── Click "Edit" → navigates to /events/:id/edit
│   ├── Click "Cancel" → PATCH /api/events/:id/cancel (with reason)
│   └── Click "Delete" → DELETE /api/events/:id (permanent, with confirmation)
└── Features used: My Events List, Event Status Management

Step 2.3 — EDIT AN EVENT
├── Organizer navigates to: /events/:id/edit
├── Pre-filled form loads with current event data
├── Modifies any field (title, description, image, dates, speakers, etc.)
├── Submits → PUT /api/events/:id
├── Toast: "Event updated!"
└── Features used: Event Editing, Form Pre-population
```

### Phase 3: Registration & Attendee Management

```
Step 3.1 — VIEW EVENT REGISTRATIONS
├── Organizer navigates to: /events/:eventId/registrations
│   (accessed from Event Detail sidebar → "View Registrations" or from My Events)
├── Page shows:
│   ├── Event title
│   ├── Stats cards: Total, Confirmed, Pending, Attended counts
│   ├── "📸 Scan Ticket" button (QR scanner)
│   ├── Search bar (search by name, email, registration number)
│   ├── Status filter dropdown (All / Confirmed / Pending / Cancelled / Attended / Waitlisted)
│   └── Registrations table:
│       ├── Attendee info (avatar, name, email)
│       ├── Registration number
│       ├── Registration date
│       ├── Status badge
│       └── Action buttons
└── Features used: Event Registrations Table, Stats Dashboard, Search, Filter

Step 3.2 — CONFIRM PENDING REGISTRATIONS (Manual Approval)
├── Organizer sees registrations with status 'pending'
├── Clicks "Confirm" button next to attendee
├── PATCH /api/registrations/:id/confirm
├── Status changes: pending → confirmed
├── Student receives notification
├── Toast: "Registration confirmed!"
└── Features used: Manual Registration Approval

Step 3.3 — CHECK-IN ATTENDEES (Manual)
├── On event day, organizer opens Event Registrations page
├── Finds confirmed attendee in table
├── Clicks "Check In" button
├── PATCH /api/registrations/:id/check-in
├── Status changes: confirmed → attended, timestamp recorded
├── Row shows "✓ Checked In" label
├── Toast: "Attendee checked in!"
└── Features used: Manual Check-In, Attendance Tracking

Step 3.4 — CHECK-IN VIA QR SCANNER
├── Organizer clicks "📸 Scan Ticket" button
├── Scanner modal opens → requests camera permission
├── Points camera at student's QR code (displayed on student's phone)
├── @yudiel/react-qr-scanner reads the QR registration ID
├── Auto-calls: PATCH /api/registrations/:id/check-in
├── Scanner closes automatically
├── Toast: "Attendee checked in!"
└── Features used: QR Scanner, Camera API, Real-Time Check-In
```

### Phase 4: Pre-Event Content Management

```
Step 4.1 — CREATE & MANAGE SESSIONS
├── Organizer navigates to: /events/:eventId/sessions
├── Sees existing sessions list (if any)
├── Clicks "Create Session" → form appears:
│   ├── Title, Description
│   ├── Speaker: name, bio, designation
│   ├── Start Time, End Time
│   ├── Location (room/hall)
│   └── Capacity
├── Submits → POST /api/sessions/:eventId
├── Can Edit any session → PUT /api/sessions/detail/:id
├── Can Delete any session → DELETE /api/sessions/detail/:id
└── Features used: Session CRUD, Speaker Management

Step 4.2 — CREATE & MANAGE SURVEYS
├── Organizer navigates to: /events/:eventId/surveys
├── Clicks "Create Survey" → form appears:
│   ├── Survey title
│   └── Questions builder (dynamic):
│       ├── Question text
│       ├── Type: Text / Radio / Checkbox
│       └── Options (for radio/checkbox)
├── Submits → POST /api/surveys/:eventId
├── Can view survey results → GET /api/surveys/detail/:id/results
├── Can delete survey → DELETE /api/surveys/detail/:id
└── Features used: Survey Creation, Question Types, Results Analytics

Step 4.3 — POST ANNOUNCEMENTS
├── Organizer navigates to: /events/:eventId/announcements
├── Fills announcement form:
│   ├── Title
│   ├── Message
│   └── Priority: High 🔴 / Medium 🟡 / Low 🟢
├── Submits → POST /api/announcements/:eventId
├── Students can see the announcement when they visit the page
├── Can delete announcements → DELETE /api/announcements/detail/:id
└── Features used: Announcement Creation, Priority System
```

### Phase 5: Dashboard & Analytics

```
Step 5.1 — ORGANIZER DASHBOARD
├── Organizer navigates to: /organizer/dashboard
├── Sees analytics:
│   ├── Stat cards: Total Events Created, Total Registrations, Upcoming Events, Total Revenue
│   ├── Registration Trends chart (Recharts area chart — last 7 days)
│   ├── Popular Events table (events sorted by registration count)
│   ├── Recent Registrations list
│   ├── Event Status summary (published/draft/cancelled counts)
│   └── "Create New Event" shortcut button
└── Features used: Organizer Analytics, Charts, Revenue Tracking
```

### Phase 6: Profile & General Features

```
Step 6.1 — PROFILE, NOTIFICATIONS, SOCIAL FEED
├── Organizer has same profile/notification/social feed features as Student
├── Can browse /feed, /events, view event details, save events
├── Can manage profile (/profile, /profile/edit, /profile/change-password)
├── Receives notifications for registrations on their events
└── Features used: All common features (Profile, Notifications, Feed)

Step 6.2 — LOGOUT
├── Clicks dropdown → "Logout"
├── POST /api/auth/logout → JWT cleared → redirected to /
└── Features used: Logout
```

---

## 7. Detailed User Journey — Admin Role

> **Role identifier:** `admin` | **Landing page after login:** `/feed` (Social Feed)

### Phase 1: Authentication

```
Step 1.1 — LOGIN
├── Admin logs in with admin credentials at: /login
├── POST /api/auth/login
├── JWT returned, stored in localStorage
├── Admin can access all admin routes
└── Note: Admin accounts are typically pre-created in the database (not self-registered)
```

### Phase 2: System Administration

```
Step 2.1 — ADMIN DASHBOARD
├── Admin navigates to: /admin
├── Sees system-wide analytics:
│   ├── Total Users in system
│   ├── Total Events created
│   ├── Total Registrations across all events
│   ├── User distribution charts (students vs organizers vs admins)
│   ├── Event analytics (by category, by faculty, by type)
│   └── Registration overview charts
└── Features used: Admin Dashboard, System Analytics, Charts

Step 2.2 — MANAGE USERS
├── Admin navigates to: /admin/users
├── Sees user management table:
│   ├── All users listed with: name, email, role, join date, status
│   ├── Search by name or email
│   ├── Filter by role (All / Student / Organizer / Admin)
│   └── Actions per user:
│       ├── Change Role: dropdown → PATCH /api/users/:id/role
│       │   (can change user↔organizer↔admin)
│       └── Delete Organizer: DELETE /api/users/:id/organizer
├── Create New Organizer:
│   ├── Opens form modal
│   ├── Fills: First Name, Last Name, Email, Password
│   ├── POST /api/users/organizers
│   └── New organizer appears in table
└── Features used: User Management, Role Assignment, Organizer Creation/Deletion

Step 2.3 — MANAGE CATEGORIES
├── Admin navigates to: /admin/categories
├── Sees category management:
│   ├── List of all event categories with name, description, color/icon
│   ├── "Add Category" button → opens form:
│   │   ├── Name, Description
│   │   └── POST /api/categories
│   ├── Edit existing category: click edit → PUT /api/categories/:id
│   └── Delete category: click delete → DELETE /api/categories/:id (with confirmation)
├── Categories appear in event creation forms and filter panels across the app
└── Features used: Category CRUD, Dynamic Category System
```

### Phase 3: Event Oversight

```
Step 3.1 — FULL EVENT ACCESS
├── Admin has same event management powers as Organizer:
│   ├── Can create events at /events/create
│   ├── Can edit any event at /events/:id/edit
│   ├── Can delete any event
│   ├── Can cancel any event
│   ├── Can view registrations for any event
│   ├── Can confirm registrations and check-in attendees
│   └── Can manage sessions, surveys, announcements for any event
└── Features used: All Organizer features (elevated privileges)
```

### Phase 4: General Features

```
Step 4.1 — COMMON FEATURES
├── Admin can access all common features:
│   ├── Browse Social Feed (/feed)
│   ├── Browse Events (/events)
│   ├── View Event Details (/events/:id)
│   ├── Manage own profile (/profile, /profile/edit, /profile/change-password)
│   ├── View notifications (/notifications)
│   └── View public user profiles (/users/:id)
└── Features used: All common features

Step 4.2 — LOGOUT
├── Clicks dropdown → "Logout"
├── POST /api/auth/logout → JWT cleared → redirected to /
└── Features used: Logout
```

---

## 8. QR Code System — Dedicated User Flow

> This section documents the complete end-to-end flow of the QR-based digital ticketing and check-in system.

### 8.1 System Overview

The QR Code system connects two user roles in a seamless check-in workflow:
- **Student** → Generates and displays a QR code ticket
- **Organizer** → Scans the QR code to mark attendance

**Technologies Used:**
| Component | Library | Purpose |
|-----------|---------|---------|
| QR Code Generation | `qrcode.react` (QRCodeSVG) | Encodes MongoDB ObjectID into scannable QR matrix |
| QR Code Scanning | `@yudiel/react-qr-scanner` (Scanner) | Uses HTML5 media devices for real-time scanning |
| Check-In API | `PATCH /api/registrations/:id/check-in` | Backend endpoint for attendance recording |

### 8.2 QR Ticket Generation Flow (Student Side)

```
                     ┌─────────────────────────┐
                     │   STUDENT REGISTERS      │
                     │   for an event           │
                     │   POST /registrations/   │
                     │   :eventId               │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  Registration created    │
                     │  Status: 'pending'       │
                     │  Auto-assigned:          │
                     │  registrationNumber      │
                     │  _id (MongoDB ObjectID)  │
                     └───────────┬─────────────┘
                                 │
                     ┌───────────┴──────────────┐
                     │  Organizer CONFIRMS      │
                     │  (or auto-confirm)       │
                     │  Status → 'confirmed'    │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  Student goes to:        │
                     │  /my-registrations       │
                     │                          │
                     │  Clicks "E-Ticket"       │
                     │  button (only visible    │
                     │  when status=confirmed)  │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  QR MODAL OPENS          │
                     │                          │
                     │  ┌───────────────────┐   │
                     │  │                   │   │
                     │  │   ██ QR CODE ██   │   │
                     │  │   (encodes the    │   │
                     │  │   registration    │   │
                     │  │   _id ObjectID)   │   │
                     │  │                   │   │
                     │  └───────────────────┘   │
                     │                          │
                     │  "Show this QR code      │
                     │   at the entrance"       │
                     │                          │
                     │  [Download Text Version] │
                     └─────────────────────────┘
```

**Step-by-step detail:**

1. **Student navigates to** → `/my-registrations` (MyRegistrations.js)
2. **Locates confirmed registration** → sees "E-Ticket" button (visible only when `reg.status === 'confirmed'`)
3. **Clicks "E-Ticket"** → `setQrModalTicket({ eventTitle, id: reg._id })` triggers modal
4. **Modal renders** → white overlay with:
   - Event title displayed at top
   - `<QRCodeSVG value={qrModalTicket.id} size={200} />` generates the QR code
   - The QR code encodes the **unique MongoDB `_id`** of the registration document
   - Instructional text: "Show this QR code at the entrance"
   - "Download Text Version" button (calls `GET /api/registrations/:id/e-ticket`, downloads .txt file)
5. **Student shows phone screen** with QR code to the organizer at the event venue

### 8.3 QR Scanning & Check-In Flow (Organizer Side)

```
                     ┌─────────────────────────┐
                     │  ORGANIZER goes to:      │
                     │  /events/:eventId/       │
                     │  registrations           │
                     │  (EventRegistrations.js) │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  Clicks "📸 Scan Ticket" │
                     │  button at top of page   │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  SCANNER MODAL OPENS     │
                     │                          │
                     │  Browser requests        │
                     │  camera permission       │
                     │  (first time only)       │
                     │                          │
                     │  Live camera feed        │
                     │  displayed in modal      │
                     │                          │
                     │  "Point your camera at   │
                     │  the student's E-Ticket" │
                     └───────────┬─────────────┘
                                 │
                     ┌───────────┴──────────────┐
                     │  Camera DETECTS QR code   │
                     │  → reads rawValue         │
                     │  (registration _id)       │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  AUTO CHECK-IN           │
                     │                          │
                     │  handleCheckIn(rawValue) │
                     │  → PATCH /api/           │
                     │  registrations/:id/      │
                     │  check-in                │
                     │                          │
                     │  Scanner auto-closes     │
                     │  Toast: "Attendee        │
                     │  checked in!"            │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  Registration updated:   │
                     │  status → 'attended'     │
                     │  checkedIn → true        │
                     │  checkInTime → now()     │
                     │                          │
                     │  Table refreshes to      │
                     │  show "✓ Checked In"     │
                     └─────────────────────────┘
```

**Step-by-step detail:**

1. **Organizer navigates to** → `/events/:eventId/registrations` (EventRegistrations.js)
2. **Clicks "📸 Scan Ticket"** → `setShowScanner(true)` opens scanner modal
3. **Browser requests camera permission** (first time only)
4. **`<Scanner>` component activates** → live camera feed with QR detection overlay
5. **Organizer points camera at student's QR** on their phone screen
6. **QR detected** → `onScan` callback fires with `result[0].rawValue` (the registration `_id`)
7. **Auto check-in** → `handleCheckIn(result[0].rawValue)` calls `PATCH /api/registrations/:id/check-in`
8. **Scanner closes** → `setShowScanner(false)`
9. **Backend updates** → registration status to `'attended'`, sets `checkedIn: true`, records timestamp
10. **Table refreshes** → fetches updated registrations, row shows "✓ Checked In" label
11. **Toast notification** → "Attendee checked in!" displayed

### 8.4 Manual Check-In (Alternative — No QR)

```
Organizer can also check-in without QR:
├── Finds attendee by name/email/registration# in the search bar
├── Clicks "Check In" button next to their name in the table
├── PATCH /api/registrations/:id/check-in
├── Same backend logic → status='attended', checkedIn=true
└── This is useful when student's phone battery is dead or camera fails
```

---

## 9. Certificate Download — Dedicated User Flow

> This section documents the complete end-to-end certificate of participation generation and download system.

### 9.1 System Overview

The certificate system provides official participation certificates to students who have **attended** events. Certificates are generated client-side as high-quality PDF documents using a branded template.

**Technologies Used:**
| Component | Library | Purpose |
|-----------|---------|---------|
| Template Rendering | `CertificateTemplate.js` (React component) | Navy/gold professional certificate layout |
| HTML to Image | `html2canvas` | Captures React component as high-res PNG |
| PDF Generation | `jsPDF` | Creates landscape PDF from captured image |
| Issuance Lock | `PATCH /api/registrations/:id/issue-certificate` | Backend ensures one-time download |

### 9.2 Certificate Eligibility

```
Certificate download is available ONLY when ALL conditions are met:
├── Registration status === 'attended' (organizer has checked-in the student)
├── reg.certificateIssued === false (certificate has not been downloaded before)
└── Student is viewing their own registration in /my-registrations
```

### 9.3 Full Certificate Generation Flow

```
                     ┌─────────────────────────┐
                     │  PRE-CONDITION:          │
                     │  Student attended event  │
                     │  (status = 'attended')   │
                     │  Certificate not yet     │
                     │  issued                  │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  Student navigates to:   │
                     │  /my-registrations       │
                     │                          │
                     │  Sees button:            │
                     │  "🎖️ Download            │
                     │   Certificate"           │
                     │  (navy blue, full-width) │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  Student clicks button   │
                     │                          │
                     │  Loading toast appears:  │
                     │  "Generating your        │
                     │  official certificate.." │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  CERTIFICATE TEMPLATE    │
                     │  RENDERS (off-screen)    │
                     │                          │
                     │  CertificateTemplate.js  │
                     │  placed at position:     │
                     │  left: -9999px           │
                     │  (invisible to user)     │
                     │                          │
                     │  Props passed:           │
                     │  • attendeeName          │
                     │  • eventTitle            │
                     │  • completionDate        │
                     │  • regNumber             │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  html2canvas CAPTURES    │
                     │  the template at 2x      │
                     │  resolution (scale: 2)   │
                     │                          │
                     │  Output: PNG image data  │
                     │  (canvas.toDataURL)      │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  jsPDF CREATES PDF       │
                     │                          │
                     │  Orientation: Landscape  │
                     │  Size: 1000 x 700 px     │
                     │  Image added at (0,0)    │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  PDF DOWNLOADS           │
                     │                          │
                     │  Filename:               │
                     │  Certificate-{regNum}.pdf│
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  BACKEND LOCK            │
                     │                          │
                     │  PATCH /registrations/   │
                     │  :id/issue-certificate   │
                     │                          │
                     │  Sets:                   │
                     │  certificateIssued: true  │
                     └───────────┬─────────────┘
                                 │
                                 ▼
                     ┌─────────────────────────┐
                     │  UI UPDATES              │
                     │                          │
                     │  Button changes to:      │
                     │  "🎖️ Certificate Issued"  │
                     │  (greyed out, disabled)  │
                     │                          │
                     │  Toast: "Certificate     │
                     │  issued and downloaded!" │
                     └─────────────────────────┘
```

### 9.4 Certificate Template Design

The certificate is a professional, branded document with the following layout:

```
┌────────────────────────────────────────────────────────────┐
│ ████████████████████████████████████████████████████████   │
│ █                                                      █   │
│ █   ┌──────────────────────────────────────────────┐   █   │
│ █   │               EVENTRIX │ OFFICIAL RECOGNITION│   █   │
│ █   │                                               │   █   │
│ █   │              CERTIFICATE                     │   █   │
│ █   │           OF PARTICIPATION                   │   █   │
│ █   │                                               │   █   │
│ █   │         This is to certify that              │   █   │
│ █   │                                               │   █   │
│ █   │    ━━━━━━ Student Full Name ━━━━━━           │   █   │
│ █   │                                               │   █   │
│ █   │   has successfully attended and participated  │   █   │
│ █   │   in the professional workshop titled         │   █   │
│ █   │         "Event Title Here"                    │   █   │
│ █   │                                               │   █   │
│ █   │   Issued on this day, April 6th, 2026        │   █   │
│ █   │                                               │   █   │
│ █   │   Eventrix Council    ⊕ SEAL    Academic Board│   █   │
│ █   │   ──────────────     VERIFIED   ──────────── │   █   │
│ █   │   OFFICIAL SIGNATURE  ID XXX   EXAMINER SIG  │   █   │
│ █   └──────────────────────────────────────────────┘   █   │
│ █                                                      █   │
│ ████████████████████████████████████████████████████████   │
└────────────────────────────────────────────────────────────┘

Design Elements:
• Outer border: 30px solid navy blue (#1a237e)
• Inner border: 3px solid gold (#c5a059)
• Branding: "EVENTRIX | OFFICIAL RECOGNITION"
• Title: "CERTIFICATE" (64px) + "OF PARTICIPATION" (20px gold)
• Attendee name: 52px navy, underlined
• Verified seal: circular double-border gold, contains ID and registration number
• Dual signatures: "Eventrix Council" and "Academic Board"
• Font style: Serif + Cursive for signatures
```

### 9.5 One-Time Issuance Security

```
Security measures to prevent duplicate certificates:
├── Frontend check: if (reg.certificateIssued) → button disabled, shows "Certificate Issued"
├── Backend check: PATCH /issue-certificate validates certificateIssued === false
├── After successful download:
│   ├── Backend sets certificateIssued: true in MongoDB
│   └── Frontend updates local state immediately for instant UI feedback
└── Result: Student cannot download the same certificate twice
```

---

## 📋 Appendix: Feature-to-Role Matrix

| Feature | Student | Organizer | Admin |
|---------|:-------:|:---------:|:-----:|
| Register / Login / Google OAuth | ✅ | ✅ | ✅ |
| Forgot / Reset Password | ✅ | ✅ | ✅ |
| Profile Management (View/Edit/Delete) | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ |
| Browse Social Feed | ✅ | ✅ | ✅ |
| Browse Event List (with filters) | ✅ | ✅ | ✅ |
| View Event Detail | ✅ | ✅ | ✅ |
| Like / Interested / Going / Reactions | ✅ | ✅ | ✅ |
| Save / Bookmark Events | ✅ | ✅ | ✅ |
| Share Events | ✅ | ✅ | ✅ |
| Calendar Export (ICS) | ✅ | ✅ | ✅ |
| View Notifications | ✅ | ✅ | ✅ |
| View Public Profiles | ✅ | ✅ | ✅ |
| Register for Events | ✅ | ❌ | ❌ |
| Payment Simulation | ✅ | ❌ | ❌ |
| View My Registrations | ✅ | ❌ | ❌ |
| Cancel Registration | ✅ | ❌ | ❌ |
| View QR E-Ticket | ✅ | ❌ | ❌ |
| Download Certificate | ✅ | ❌ | ❌ |
| Submit Feedback / Review | ✅ | ❌ | ❌ |
| Fill Surveys | ✅ | ❌ | ❌ |
| Add Sessions to Schedule | ✅ | ❌ | ❌ |
| Schedule Planner | ✅ | ❌ | ❌ |
| Student Dashboard | ✅ | ❌ | ❌ |
| Saved Events Page | ✅ | ❌ | ❌ |
| View Announcements | ✅ | ✅ | ✅ |
| View Sessions | ✅ | ✅ | ✅ |
| Create Events | ❌ | ✅ | ✅ |
| Edit / Delete / Cancel Events | ❌ | ✅ (own) | ✅ (any) |
| My Events Page | ❌ | ✅ | ✅ |
| View Event Registrations | ❌ | ✅ (own) | ✅ (any) |
| Confirm Registrations | ❌ | ✅ | ✅ |
| Check-In Attendees (Manual + QR) | ❌ | ✅ | ✅ |
| Create / Manage Sessions | ❌ | ✅ | ✅ |
| Create / Manage Surveys | ❌ | ✅ | ✅ |
| View Survey Results | ❌ | ✅ | ✅ |
| Post / Delete Announcements | ❌ | ✅ | ✅ |
| Organizer Dashboard | ❌ | ✅ | ❌ |
| Admin Dashboard | ❌ | ❌ | ✅ |
| Manage Users (View/Role/Create/Delete) | ❌ | ❌ | ✅ |
| Manage Categories (CRUD) | ❌ | ❌ | ✅ |

---

> **Document Generated:** April 2026  
> **System:** Eventrix — University Event Management Platform  
> **Total Features Documented:** 10 major feature areas, 77 CRUD operations, 30+ UI pages  
> **Total User Journey Steps:** 50+ steps across 3 roles  
> **Dedicated Flows:** QR Code System + Certificate Download
