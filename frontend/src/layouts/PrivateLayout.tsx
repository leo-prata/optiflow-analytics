import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export function PrivateLayout() {
  const isAuthenticated = !!localStorage.getItem('optiflow_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#1f2130ff' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: '80px' }}>
        <Outlet />
      </div>
    </div>
  );
}