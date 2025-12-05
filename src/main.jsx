import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router.jsx';
import { supabase } from './supabaseClient';
import { seedSupabase } from './lib/seedSupabase';

// Seed the database with mock data on application startup
seedSupabase();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
