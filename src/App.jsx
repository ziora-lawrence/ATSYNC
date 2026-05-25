import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landingpage from './pages/landingpage';
import Agentonboard from './pages/agentonboard';
import DashboardLayout from './pages/dashboardLayout';
import Dashboard from './pages/dashboard';
import Clients from './pages/clients';
import IntakeLinks from './pages/intakelinks';
import Bob from './pages/bob';
import Marketplace from './pages/marketplace';
import Settings from './pages/settings';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/agent-onboard" element={<Agentonboard />} />
      
      {/* Nested Dashboard Center Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="intake" element={<IntakeLinks />} />
        <Route path="bob" element={<Bob />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;