import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

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
      { path: `/${user.role}`, label: 'Dashboard' },
      { path: '/announcements', label: 'Announcements' },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseLinks,
          { path: '/admin/classes', label: 'Classes' },
          { path: '/admin/students', label: 'Students' },
          { path: '/admin/teachers', label: 'Teachers' },
        ];
      case 'teacher':
        return [
          ...baseLinks,
          { path: '/teacher/attendance', label: 'Attendance' },
          { path: '/teacher/marks', label: 'Marks' },
        ];
      case 'student':
        return [
          ...baseLinks,
          { path: '/student/attendance', label: 'My Attendance' },
          { path: '/student/marks', label: 'My Marks' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SMS</h1>
        </div>
        <nav className="mt-6">
          {getNavLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            >
              {link.label}
            </Link>
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
                Role: <span className="font-semibold text-blue-600">{user.role}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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
