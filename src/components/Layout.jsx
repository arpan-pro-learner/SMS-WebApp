import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">SMS</h1>
        </div>
        <nav className="mt-6">
          {/* Navigation links can be added here */}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-end h-16 bg-white shadow-md">
          <button
            onClick={handleLogout}
            className="px-4 py-2 mr-6 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
