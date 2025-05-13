import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileUp, 
  Settings, 
  Shield, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  to: string;
  end?: boolean;
}> = ({ icon, label, to, end = false }) => (
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
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { isSuperAdmin, logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">Insurance Admin</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
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
        <NavItem 
          icon={<FileUp className="h-5 w-5" />} 
          label="Documents" 
          to="/documents" 
        />
        
        {isSuperAdmin && (
          <NavItem 
            icon={<Shield className="h-5 w-5" />} 
            label="Admin Management" 
            to="/admin-management" 
          />
        )}
        
        <NavItem 
          icon={<Settings className="h-5 w-5" />} 
          label="Settings" 
          to="/settings" 
        />
      </nav>
      
      <div className="p-4 border-t border-border">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};