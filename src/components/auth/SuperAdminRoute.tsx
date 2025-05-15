import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldX } from 'lucide-react';

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <ShieldX className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-gray-500 max-w-md text-center mt-2">
          This page is only accessible to Super Admins. Please contact a Super Admin if you need access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}; 