import React from 'react';
import { Bell, Menu, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { currentAdmin, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-border px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <button className="lg:hidden mr-2 p-1 rounded-md">
          <Menu className="h-6 w-6 text-gray-500" />
        </button>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-1 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="relative">
          <button 
            className="flex items-center gap-2"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
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
              <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
              <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
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