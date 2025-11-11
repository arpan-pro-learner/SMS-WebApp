import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';

const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
