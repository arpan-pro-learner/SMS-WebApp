import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout'; // Assuming you have a Layout component

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default AppLayout;
