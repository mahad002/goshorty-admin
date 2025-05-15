import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileUp, 
  Settings, 
  Shield, 
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  to: string;
  end?: boolean;
  onClick?: () => void;
}> = ({ icon, label, to, end = false, onClick }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => 
      `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`
    }
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { isSuperAdmin, logout } = useAuth();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();

  // Close sidebar on location change (mobile) but only after navigation
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        closeSidebar();
      }
    };
    
    // We want to close after the navigation, not immediately
    return () => handleLocationChange();
  }, [location.pathname, closeSidebar]);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeSidebar]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the overlay (not its children)
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 
          flex flex-col
          w-64 bg-white border-r border-border
          transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          </div>
          <button 
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              closeSidebar();
            }}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Regular Admin Menu Items */}
          {!isSuperAdmin && (
            <>
              <NavItem 
                icon={<LayoutDashboard className="h-5 w-5" />} 
                label="Dashboard" 
                to="/"
                end
              />
              <NavItem 
                icon={<Users className="h-5 w-5" />} 
                label="Users" 
                to="/users" 
              />
              <NavItem 
                icon={<FileText className="h-5 w-5" />} 
                label="Policies" 
                to="/policies" 
              />
            </>
          )}
          
          {/* Super Admin Menu Items */}
          {isSuperAdmin && (
            <NavItem 
              icon={<Shield className="h-5 w-5" />} 
              label="Admin Management" 
              to="/admin-management" 
            />
          )}
          
          {/* Common Menu Items */}
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            to="/settings" 
          />
        </nav>
        
        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};