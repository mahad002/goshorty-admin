import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Admin, User, UserRole } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  currentAdmin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createAdmin: (adminData: Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>) => Promise<boolean>;
  updateAdmin: (id: string, adminData: Partial<Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>>) => Promise<boolean>;
  toggleAdminStatus: (id: string, action: 'pause' | 'activate' | 'extend') => Promise<boolean>;
  updateAdminPassword: (id: string, password: string) => Promise<boolean>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'insurances'>) => Promise<boolean>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  createPolicy: (policyData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ADMINS = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@email.com',
    role: UserRole.SUPER_ADMIN,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    assignedUsers: [],
  },
  {
    id: '2',
    name: 'Admin',
    email: 'admin@email.com',
    role: UserRole.ADMIN,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
    assignedUsers: ['1', '2'],
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved admin in localStorage (simulating persistence)
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
      setCurrentAdmin(JSON.parse(savedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check hardcoded credentials
      if (
        (email === 'superadmin@email.com' && password === 'superadmin') ||
        (email === 'admin@email.com' && password === 'admin')
      ) {
        const admin = DEMO_ADMINS.find(a => a.email === email);
        if (admin) {
          setCurrentAdmin(admin);
          localStorage.setItem('currentAdmin', JSON.stringify(admin));
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('currentAdmin');
    navigate('/login');
  };

  const createAdmin = async (adminData: Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call to create the admin
      console.log('Creating admin:', adminData);
      
      // Simulate success
      toast.success('Admin created successfully');
      return true;
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create admin');
      return false;
    }
  };

  const updateAdmin = async (id: string, adminData: Partial<Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>>): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call to update the admin
      console.log('Updating admin:', id, adminData);
      
      // Simulate success
      toast.success('Admin updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin');
      return false;
    }
  };

  const toggleAdminStatus = async (id: string, action: 'pause' | 'activate' | 'extend'): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call to update the admin status
      console.log('Toggling admin status:', id, action);
      
      let message = '';
      switch (action) {
        case 'pause':
          message = 'Admin account paused';
          break;
        case 'activate':
          message = 'Admin account activated';
          break;
        case 'extend':
          message = 'Admin expiration extended';
          break;
      }
      
      // Simulate success
      toast.success(message);
      return true;
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
      return false;
    }
  };

  const createPolicy = async (policyData: any): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call to create the policy
      console.log('Creating policy:', policyData);
      
      // Simulate success
      toast.success('Policy created successfully');
      return true;
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy');
      return false;
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'insurances'>): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call to create the user
      console.log('Creating user:', userData);
      
      // Simulate success
      toast.success('User created successfully');
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      return false;
    }
  };

  const updateAdminPassword = async (id: string, password: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would make an API call to update the admin's password
      console.log('Updating admin password:', id);
      
      // Simulate success
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
      return false;
    }
  };

  const value = {
    currentAdmin,
    isLoading,
    login,
    logout,
    createAdmin,
    updateAdmin,
    toggleAdminStatus,
    updateAdminPassword,
    createUser,
    createPolicy,
    isAuthenticated: !!currentAdmin,
    isSuperAdmin: currentAdmin?.role === UserRole.SUPER_ADMIN,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};