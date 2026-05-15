import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MockTest from './pages/MockTest';
import Result from './pages/Result';
import MyResults from './pages/MyResults';
import PYQ from './pages/PYQ';
import ChapterTests from './pages/ChapterTests';
import Profile from './pages/Profile';
import Leaderboard from './components/Leaderboard';
import Notifications from './pages/Notifications';
import Bookmarks from './pages/Bookmarks';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <HelmetProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200 pb-16 md:pb-0">
            <Navbar />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/test/:id" element={<PrivateRoute><MockTest /></PrivateRoute>} />
                <Route path="/results" element={<PrivateRoute><MyResults /></PrivateRoute>} />
                <Route path="/results/:id" element={<PrivateRoute><Result /></PrivateRoute>} />
                <Route path="/leaderboard" element={<PrivateRoute><div className="pt-8"><Leaderboard /></div></PrivateRoute>} />
                <Route path="/pyq" element={<PrivateRoute><PYQ /></PrivateRoute>} />
                <Route path="/chapter-tests" element={<PrivateRoute><ChapterTests /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              </Routes>
            </main>
            <BottomNav />
            <div className="hidden md:block"><Footer /></div>
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
