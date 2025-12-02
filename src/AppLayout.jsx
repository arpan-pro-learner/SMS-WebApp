import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import useUserStore from './store/userStore';

function AppLayout() {
  const { user } = useUserStore();
  const role = user?.role; // Get the current role from the store

  return (
    <Layout>
      <Outlet key={role} />
    </Layout>
  );
}

export default AppLayout;
