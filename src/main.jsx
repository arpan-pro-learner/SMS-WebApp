import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router.jsx';
import { supabase } from './supabaseClient';
import { seedSupabase } from './lib/seedSupabase';

import { Toaster } from 'react-hot-toast';

console.log('[main.jsx] Initializing application...');

// Seed the database only in development mode to avoid issues in production
if (import.meta.env.DEV) {
  console.log('[main.jsx] Development mode detected. Running seeder...');
  seedSupabase().catch(error => {
    console.error('[main.jsx] Critical error during seeding:', error);
  });
} else {
  console.log('[main.jsx] Production mode detected. Skipping seeder.');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
    <Toaster position="top-center" reverseOrder={false} />
  </StrictMode>
);
