import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dokumen from './pages/master-data/Dokumen';
import Ticketing from './pages/Ticketing';
import WhatsApp from './pages/WhatsApp';
import Overview from './pages/Overview';

import LandingLayout from './layouts/LandingLayout';
import LandingPage from './pages/LandingPage';


import UserManagement from './pages/settings/UserManagement';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Dashboard Placeholder Pages

import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />

        </Route>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="master-data" element={<Navigate to="/dashboard/master-data/dokumen" replace />} />
          <Route path="master-data/dokumen" element={<Dokumen />} />
          
          <Route path="tickets" element={<Ticketing />} />
          <Route path="settings" element={<Navigate to="/dashboard/settings/users" replace />} />
          <Route path="settings/users" element={<UserManagement />} />
          <Route path="whatsapp" element={<WhatsApp />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
