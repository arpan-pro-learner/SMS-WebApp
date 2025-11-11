import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
      {
        path: 'teacher',
        element: <TeacherDashboard />,
      },
      {
        path: 'student',
        element: <StudentDashboard />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
