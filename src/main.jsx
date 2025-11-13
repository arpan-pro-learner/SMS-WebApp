import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router.jsx';
import { supabase } from './supabaseClient';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
