import React, { useEffect } from 'react'
import {Routes, Route} from 'react-router-dom'
import Landingpage from './pages/landingpage'
import Agentonboard from './pages/agentonboard'
import Dashboard from './pages/dashboard'
import { supabase } from './lib/supabase'

const App = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Sync session details to localStorage for backend compatibility if not already set
        if (!localStorage.getItem('atsync_token')) {
          localStorage.setItem('atsync_token', session.access_token);
          
          try {
            // Fetch the agency name from profiles table
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
    <>
      <Routes>
        <Route path='/' element={<Landingpage/>}/>
        <Route path='/agent-onboard' element={<Agentonboard/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </>
  )
}

export default App