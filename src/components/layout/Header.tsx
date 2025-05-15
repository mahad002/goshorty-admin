import React, { useEffect, useRef } from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

export const Header: React.FC = () => {
  const { currentAdmin, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    toggleSidebar();
  };

  return (
    <header className="bg-white border-b border-border px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <button 
          ref={menuButtonRef}
          className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={handleMenuClick}
          aria-label="Toggle sidebar"
          type="button"
        >
          <Menu className="h-6 w-6 text-gray-500" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative" ref={profileRef}>
          <button 
            className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            type="button"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              {currentAdmin?.name.charAt(0)}
            </div>
            <span className="hidden md:block text-sm font-medium">{currentAdmin?.name}</span>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-border">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium">{currentAdmin?.name}</p>
                <p className="text-xs text-gray-500">{currentAdmin?.email}</p>
              </div>

              <button 
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};