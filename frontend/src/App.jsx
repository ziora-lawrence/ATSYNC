import React, { useEffect } from 'react';
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
import ResetPassword from './pages/resetpassword';
import Payments from './pages/payments';
import { supabase } from './lib/supabase';

const App = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        if (!localStorage.getItem('atsync_token')) {
          localStorage.setItem('atsync_token', session.access_token);
          
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('agency_name')
              .eq('id', session.user.id)
              .single();

            if (!error && profile) {
              localStorage.setItem('atsync_user', JSON.stringify({
                email: session.user.email,
                agencyName: profile.agency_name,
              }));
            } else {
              localStorage.setItem('atsync_user', JSON.stringify({
                email: session.user.email,
                agencyName: session.user.user_metadata?.agency_name || '',
              }));
            }
          } catch (err) {
            console.error('Error fetching profile in onAuthStateChange:', err);
            localStorage.setItem('atsync_user', JSON.stringify({
              email: session.user.email,
              agencyName: session.user.user_metadata?.agency_name || '',
            }));
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/agent-onboard" element={<Agentonboard />} />
      <Route path="/reset" element={<ResetPassword />} />
      
      {/* Nested Dashboard Center Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="payments" element={<Payments />} />
        <Route path="intake" element={<IntakeLinks />} />
        <Route path="bob" element={<Bob />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;