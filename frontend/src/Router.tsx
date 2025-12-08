import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react';

// Páginas
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SpacexPage from './pages/SpacexPage';
import Layout from './components/Layout';
import { AuthContext } from './context/AuthContext';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/spacex"
        element={
          <PrivateRoute>
            <SpacexPage />
          </PrivateRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}