import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { Toaster } from 'react-hot-toast';

// Lazy loaded routes for much faster initial load times
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MockTest = lazy(() => import('./pages/MockTest'));
const Result = lazy(() => import('./pages/Result'));
const MyResults = lazy(() => import('./pages/MyResults'));
const ChapterTests = lazy(() => import('./pages/ChapterTests'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200 ${!isAdminRoute ? 'pb-24 md:pb-8' : ''}`}>
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow ${!isAdminRoute ? 'pt-24' : ''}`}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-indigo-600 dark:text-indigo-400 font-bold text-xl"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mr-3"></div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/test/:id" element={<PrivateRoute><MockTest /></PrivateRoute>} />
            <Route path="/results" element={<PrivateRoute><MyResults /></PrivateRoute>} />
            <Route path="/results/:id" element={<PrivateRoute><Result /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><div className="pt-8"><Leaderboard /></div></PrivateRoute>} />
            <Route path="/chapter-tests" element={<PrivateRoute><ChapterTests /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <BottomNav />}
      {!isAdminRoute && <div className="hidden md:block"><Footer /></div>}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
