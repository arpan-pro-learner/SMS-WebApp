import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, NavLink } from 'react-router-dom'; // Use NavLink for active state styling

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userProfile) {
          setUser({ ...session.user, role: userProfile.role });
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    const baseLinks = [
      { path: `/app/${user.role}`, label: 'Dashboard' },
      { path: '/app/announcements', label: 'Announcements' },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseLinks,
          { path: '/app/admin/classes', label: 'Classes' },
          { path: '/app/admin/students', label: 'Students' },
          { path: '/app/admin/teachers', label: 'Teachers' },
        ];
      case 'teacher':
        return [
          ...baseLinks,
          { path: '/app/teacher/attendance', label: 'Attendance' },
          { path: '/app/teacher/marks', label: 'Marks' },
        ];
      case 'student':
        return [
          ...baseLinks,
          { path: '/app/student/attendance', label: 'My Attendance' },
          { path: '/app/student/marks', label: 'My Marks' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">Loading application...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">SMS</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {getNavLinks().map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition duration-150 ease-in-out
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 bg-white shadow-md px-6">
          <div>
            {user && (
              <span className="text-sm font-medium text-gray-700">
                Role: <span className="font-semibold text-blue-600 capitalize">{user.role}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
