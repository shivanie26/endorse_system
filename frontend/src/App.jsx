import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout      from './pages/AppLayout';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import WelcomePage    from './pages/WelcomePage';
import DashboardPage  from './pages/DashboardPage';
import UsersPage      from './pages/UsersPage';
import SkillsPage     from './pages/SkillsPage';
import ProfilePage    from './pages/ProfilePage';
import './styles/globals.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* After login welcome */}
        <Route path="/welcome" element={
          <ProtectedRoute><WelcomePage /></ProtectedRoute>
        } />

        {/* App with Topbar */}
        <Route path="/" element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route index           element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users"     element={<UsersPage />} />
          <Route path="skills"    element={<SkillsPage />} />
          <Route path="profile"   element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>

    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background:  'var(--card2)',
          color:       'var(--text)',
          border:      '1px solid var(--border2)',
          borderRadius:'12px',
          fontSize:    '13.5px',
          fontFamily:  'var(--font-body)',
          boxShadow:   '0 4px 24px rgba(0,0,0,0.4)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </AuthProvider>
);

export default App;
