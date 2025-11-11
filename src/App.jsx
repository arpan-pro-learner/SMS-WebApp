import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          const fetchProfile = async () => {
            const { data: profile } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single();
            setUserProfile(profile);
          };
          fetchProfile();
        } else {
          setUserProfile(null);
          navigate('/login');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (session && userProfile) {
      const rolePath = `/${userProfile.role}`;
      if (location.pathname !== rolePath) {
        navigate(rolePath, { replace: true });
      }
    } else if (!session && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [session, userProfile, location.pathname, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {session && userProfile?.role === 'admin' && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}
      {session && userProfile?.role === 'teacher' && (
        <Route path="/teacher" element={<TeacherDashboard />} />
      )}
      {session && userProfile?.role === 'student' && (
        <Route path="/student" element={<StudentDashboard />} />
      )}
    </Routes>
  );
}

export default App;
