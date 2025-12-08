import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import useUserStore from './store/userStore';

function AppLayout() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    // Only fetch the user on initial load if they don't exist in the store.
    // This prevents overwriting the role when an admin performs a role-switch.
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const role = user?.role; // Get the current role from the store

  return (
    <Layout>
      <Outlet key={role} />
    </Layout>
  );
}

export default AppLayout;
