import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from '../../contexts/SidebarContext';

export const Layout: React.FC = () => {
  // Force scroll to top on navigation
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="flex flex-col lg:flex-row h-screen w-screen overflow-x-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-h-screen w-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};