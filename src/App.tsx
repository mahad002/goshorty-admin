import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { Policies } from './pages/Policies';
import { PolicyDetail } from './pages/PolicyDetail';

import { AdminManagement } from './pages/AdminManagement';
import { Settings } from './pages/Settings';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SuperAdminRoute } from './components/auth/SuperAdminRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Component to redirect based on role
const RoleRedirect = () => {
  const { isSuperAdmin } = useAuth();
  return <Navigate to={isSuperAdmin ? "/admin-management" : "/"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Regular Admin Routes */}
          <Route index element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
    
          <Route path="policies" element={<AdminRoute><Policies /></AdminRoute>} />
          <Route path="policies/:id" element={<AdminRoute><PolicyDetail /></AdminRoute>} />
        
          
          {/* Super Admin Routes */}
          <Route path="admin-management" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
          
          {/* Common Routes */}
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;