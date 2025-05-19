import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Admin, User, UserRole, UserStatus } from '../types';
import { toast } from 'sonner';
import { setToken, removeToken, getToken, isAuthenticated as checkIsAuthenticated, ALWAYS_USE_BACKEND } from '../services/service';
import { loginSuperAdmin, registerAdmin as registerAdminApi, updateAdmin as updateAdminApi, changePassword, updateProfile } from '../services/superadminservice';
import { createPolicy as createPolicyApi } from '../services/adminService';

interface AuthContextType {
  currentAdmin: Admin | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createAdmin: (adminData: Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'> & { password: string }) => Promise<boolean>;
  updateAdmin: (id: string, adminData: Partial<Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>> & { password?: string }) => Promise<boolean>;
  toggleAdminStatus: (id: string, action: 'pause' | 'activate' | 'extend') => Promise<boolean>;
  updateAdminPassword: (id: string, password: string) => Promise<boolean>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'insurances'>) => Promise<boolean>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  createPolicy: (policyData: any) => Promise<boolean>;
  updateCurrentAdmin: (profileData: { username: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo admins for development - will use API in production
export const DEMO_ADMINS = [
  {
    id: '1',
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    assignedUsers: [],
  },
  {
    id: '2',
    name: 'Admin',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
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

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Use the API for login rather than mock data
      if (ALWAYS_USE_BACKEND) {
        const response = await loginSuperAdmin(username, password);
        
        if (response && response.token) {
          const adminData: Admin = {
            id: response._id,
            name: response.username,
            role: response.role === 'superadmin' ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
            assignedUsers: [],
          };
          
          setCurrentAdmin(adminData);
          setToken(response.token);
          localStorage.setItem('currentAdmin', JSON.stringify(adminData));
          setIsLoading(false);
          return true;
        }
      } else {
        // Fallback for testing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check hardcoded credentials
        if (
          (username === 'superadmin' && password === 'superadmin') ||
          (username === 'admin' && password === 'admin')
        ) {
          const admin = DEMO_ADMINS.find(a => a.name.toLowerCase() === username.toLowerCase());
          if (admin) {
            setCurrentAdmin(admin);
            localStorage.setItem('currentAdmin', JSON.stringify(admin));
            setIsLoading(false);
            return true;
          }
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
    removeToken();
    navigate('/login');
  };

  const createAdmin = async (adminData: Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'> & { password: string }): Promise<boolean> => {
    try {
      if (ALWAYS_USE_BACKEND) {
        // Transform frontend adminData to match backend API
        const backendAdminData = {
          username: adminData.name,
          password: adminData.password,
          role: adminData.role === UserRole.SUPER_ADMIN ? 'superadmin' : 'admin',
          expirationDate: adminData.expiresAt,
          status: adminData.status === UserStatus.ACTIVE ? 'active' : 'inactive'
        };
        
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return false;
        }
        
        await registerAdminApi(backendAdminData, token);
        toast.success('Admin created successfully');
        return true;
      } else {
        // Simulate API delay in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Creating admin:', adminData);
        toast.success('Admin created successfully');
        return true;
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin');
      return false;
    }
  };

  const updateAdmin = async (id: string, adminData: Partial<Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>> & { password?: string }): Promise<boolean> => {
    try {
      if (ALWAYS_USE_BACKEND) {
        // Transform frontend adminData to match backend API
        const backendAdminData: Record<string, any> = {};
        
        if (adminData.name) backendAdminData.username = adminData.name;
        if (adminData.role) backendAdminData.role = adminData.role === UserRole.SUPER_ADMIN ? 'superadmin' : 'admin';
        if (adminData.expiresAt) backendAdminData.expirationDate = adminData.expiresAt;
        if (adminData.status) backendAdminData.status = adminData.status === UserStatus.ACTIVE ? 'active' : 'inactive';
        
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return false;
        }
        
        await updateAdminApi(id, backendAdminData, token);
        
        // If password was provided, update it separately
        if (adminData.password) {
          await changePassword({
            adminId: id,
            newPassword: adminData.password
          }, token);
        }
        
        toast.success('Admin updated successfully');
        return true;
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Updating admin:', id, adminData);
        toast.success('Admin updated successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update admin');
      return false;
    }
  };

  const toggleAdminStatus = async (id: string, action: 'pause' | 'activate' | 'extend'): Promise<boolean> => {
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return false;
        }
        
        // Determine the action and prepare data accordingly
        let adminData: any = {};
        
        if (action === 'pause') {
          adminData.status = 'inactive';
        } else if (action === 'activate') {
          adminData.status = 'active';
        } else if (action === 'extend') {
          // Set expiration date to 30 days from now
          const newExpirationDate = new Date();
          newExpirationDate.setDate(newExpirationDate.getDate() + 30);
          adminData.expirationDate = newExpirationDate;
          adminData.status = 'active';
        }
        
        await updateAdminApi(id, adminData, token);
        
        let message = '';
        switch (action) {
          case 'pause': message = 'Admin account paused'; break;
          case 'activate': message = 'Admin account activated'; break;
          case 'extend': message = 'Admin expiration extended'; break;
        }
        
        toast.success(message);
        return true;
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would make an API call to update the admin status
        console.log('Toggling admin status:', id, action);
        
        let message = '';
        switch (action) {
          case 'pause': message = 'Admin account paused'; break;
          case 'activate': message = 'Admin account activated'; break;
          case 'extend': message = 'Admin expiration extended'; break;
        }
        
        toast.success(message);
        return true;
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update admin status');
      return false;
    }
  };

  const updateAdminPassword = async (id: string, password: string): Promise<boolean> => {
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return false;
        }
        
        await changePassword({
          adminId: id,
          newPassword: password
        }, token);
        
        toast.success('Password updated successfully');
        return true;
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Updating admin password:', id);
        toast.success('Password updated successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
      return false;
    }
  };

  const createPolicy = async (policyData: any): Promise<boolean> => {
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return false;
        }
        
        // Format data for backend API
        const backendPolicyData = {
          policyNumber: policyData.policy.policyNumber,
          user: policyData.userId,
          vehicle: policyData.policy.vehicle,
          registration: policyData.policy.registration,
          coverStart: policyData.policy.coverStart.toISOString().split('T')[0],
          coverEnd: policyData.policy.coverEnd.toISOString().split('T')[0],
          status: policyData.policy.status === 'ACTIVE' ? 'Live' : 'Expired',
          type: policyData.insurance.type,
          policyHolder: policyData.policy.policyHolder,
          additionalDriver: policyData.policy.additionalDriver || 'None',
          insurerName: policyData.insurance.insurerName,
          insurerClaimsLine: policyData.insurance.insurerClaimsLine || '0800 123 4567',
        };
        
        await createPolicyApi(backendPolicyData, token);
        toast.success('Policy created successfully');
        return true;
      } else {
        // Simulate API delay in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Creating policy:', policyData);
        toast.success('Policy created successfully');
        return true;
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy');
      return false;
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'insurances'>): Promise<boolean> => {
    try {
      // Placeholder for future implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating user:', userData);
      toast.success('User created successfully');
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      return false;
    }
  };

  // New function to update current admin profile
  const updateCurrentAdmin = async (profileData: { username: string }): Promise<boolean> => {
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token || !currentAdmin) {
          toast.error('Authentication required');
          return false;
        }
        
        const response = await updateProfile({
          username: profileData.username,
        }, token);
        
        // Update the admin in the local state and localStorage
        if (response) {
          const updatedAdmin: Admin = {
            ...currentAdmin,
            name: profileData.username,
          };
          
          setCurrentAdmin(updatedAdmin);
          localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
          toast.success('Profile updated successfully');
          return true;
        } else {
          toast.error('Failed to update profile');
          return false;
        }
      } else {
        // Handle mock environment
        if (currentAdmin) {
          const updatedAdmin: Admin = {
            ...currentAdmin,
            name: profileData.username,
          };
          
          setCurrentAdmin(updatedAdmin);
          localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
          toast.success('Profile updated successfully (mock)');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
    updateCurrentAdmin,
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