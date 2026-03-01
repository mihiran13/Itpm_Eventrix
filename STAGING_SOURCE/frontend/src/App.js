import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback';

// Public Pages
import Home from './pages/Home';
import EventList from './pages/events/EventList';
import EventDetail from './pages/events/EventDetail';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import OrganizerDashboard from './pages/dashboard/OrganizerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Pages
import CreateEvent from './pages/events/CreateEvent';
import EditEvent from './pages/events/EditEvent';
import MyEvents from './pages/events/MyEvents';
import SavedEvents from './pages/events/SavedEvents';
import MyRegistrations from './pages/registrations/MyRegistrations';
import EventRegistrations from './pages/registrations/EventRegistrations';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import ChangePassword from './pages/profile/ChangePassword';
import Notifications from './pages/notifications/Notifications';

// Admin Pages
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';

// New Feature Pages
import SocialFeed from './pages/feed/SocialFeed';
import PaymentSimulation from './pages/registrations/PaymentSimulation';
import ManageSessions from './pages/sessions/ManageSessions';
import SchedulePlanner from './pages/schedule/SchedulePlanner';
import SurveyPage from './pages/surveys/SurveyPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import UserPublicProfile from './pages/profile/UserPublicProfile';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import OrganizerRoute from './components/common/OrganizerRoute';
import StudentRoute from './components/common/StudentRoute';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/users/:id" element={<UserPublicProfile />} />

                {/* Student Routes */}
                <Route path="/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
                <Route path="/saved-events" element={<PrivateRoute><SavedEvents /></PrivateRoute>} />
                <Route path="/my-registrations" element={<PrivateRoute><MyRegistrations /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
                <Route path="/profile/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

                {/* Organizer Routes */}
                <Route path="/organizer/dashboard" element={<OrganizerRoute><OrganizerDashboard /></OrganizerRoute>} />
                <Route path="/events/create" element={<OrganizerRoute><CreateEvent /></OrganizerRoute>} />
                <Route path="/events/:id/edit" element={<OrganizerRoute><EditEvent /></OrganizerRoute>} />
                <Route path="/my-events" element={<OrganizerRoute><MyEvents /></OrganizerRoute>} />
                <Route path="/events/:eventId/registrations" element={<OrganizerRoute><EventRegistrations /></OrganizerRoute>} />

                {/* Social Feed (accessible to all, main page after login) */}
                <Route path="/feed" element={<SocialFeed />} />

                {/* Session Management */}
                <Route path="/events/:eventId/sessions" element={<ManageSessions />} />

                {/* Schedule Planner */}
                <Route path="/schedule" element={<PrivateRoute><SchedulePlanner /></PrivateRoute>} />

                {/* Surveys */}
                <Route path="/events/:eventId/surveys" element={<SurveyPage />} />

                {/* Announcements */}
                <Route path="/events/:eventId/announcements" element={<AnnouncementsPage />} />

                {/* Payment Simulation */}
                <Route path="/payment/:id" element={<PrivateRoute><PaymentSimulation /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '10px',
                padding: '12px 20px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
