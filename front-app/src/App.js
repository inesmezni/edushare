import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import StudentDashboard from './pages/StudentDashboard';
import ContributorDashboard from './pages/ContributorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadVideo from './pages/UploadVideo';
import Profile from './pages/Profile';
import EditVideo from './pages/EditVideo';
import './App.css';

// Route protégée
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Route admin
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin() ? children : <Navigate to="/" />;
};

// Route contributeur
const ContributorRoute = ({ children }) => {
  const { isContributor, isAdmin, loading } = useAuth();
  if (loading) return null;
  return (isContributor() || isAdmin()) ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  const { isAdmin, isContributor } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/videos/:id" element={<VideoDetail />} />

        {/* Profil */}
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />

        {/* Dashboard selon rôle */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            {isAdmin() ? <Navigate to="/admin" /> :
             isContributor() ? <ContributorDashboard /> :
             <StudentDashboard />}
          </PrivateRoute>
        } />

        <Route path="/dashboard/student" element={
          <PrivateRoute><StudentDashboard /></PrivateRoute>
        } />

        <Route path="/dashboard/contributor" element={
          <PrivateRoute>
            <ContributorRoute><ContributorDashboard /></ContributorRoute>
          </PrivateRoute>
        } />

        {/* Upload vidéo */}
        <Route path="/upload" element={
          <PrivateRoute>
            <ContributorRoute><UploadVideo /></ContributorRoute>
          </PrivateRoute>
        } />

        {/* Modifier une vidéo */}
        <Route path="/edit-video/:id" element={
          <PrivateRoute>
            <ContributorRoute><EditVideo /></ContributorRoute>
          </PrivateRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminRoute><AdminDashboard /></AdminRoute>
          </PrivateRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          toastStyle={{
            borderRadius: '12px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
