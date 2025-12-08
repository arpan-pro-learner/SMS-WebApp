import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import { supabase } from './supabaseClient';
import AdminClasses from './pages/AdminClasses';
import AdminStudents from './pages/AdminStudents';
import AdminTeachers from './pages/AdminTeachers';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherMarks from './pages/TeacherMarks';
import StudentAttendance from './pages/StudentAttendance';
import StudentMarks from './pages/StudentMarks';
import Announcements from './pages/Announcements';
import useUserStore from './store/userStore';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { path: 'admin', element: <AdminDashboard /> },
          { path: 'admin/classes', element: <AdminClasses /> },
          { path: 'admin/students', element: <AdminStudents /> },
          { path: 'admin/teachers', element: <AdminTeachers /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['teacher']} />,
        children: [
          { path: 'teacher', element: <TeacherDashboard /> },
          { path: 'teacher/attendance', element: <TeacherAttendance /> },
          { path: 'teacher/marks', element: <TeacherMarks /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['student']} />,
        children: [
          { path: 'student', element: <StudentDashboard /> },
          { path: 'student/attendance', element: <StudentAttendance /> },
          { path: 'student/marks', element: <StudentMarks /> },
        ],
      },
      {
        path: 'announcements',
        element: <Announcements />,
      },
      {
        index: true,
        element: <RootRedirect />,
      }
    ],
  },
]);

function RootRedirect() {
  const { user, loading } = useUserStore();

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Use the role from the store, which could be the original or the switched-to role
  const currentRole = user.role;

  switch (currentRole) {
    case 'admin':
      return <Navigate to="/app/admin" replace />;
    case 'teacher':
      return <Navigate to="/app/teacher" replace />;
    case 'student':
      return <Navigate to="/app/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function Router() {
  return <RouterProvider router={router} />;
}
