import axios from 'axios';
import { API_URL, authAxios, handleApiError } from './service';

interface AdminData {
  username: string;
  email: string;
  password: string;
  role: string;
  expirationDate?: Date;
  status?: string;
}

interface PasswordChangeData {
  adminId?: string;
  currentPassword?: string;
  newPassword: string;
}

interface AdminResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  expirationDate?: string;
  status?: string;
  token?: string;
}

// Super admin login (shared with admin)
const loginSuperAdmin = async (email: string, password: string): Promise<AdminResponse> => {
  try {
    const response = await axios.post(`${API_URL}/admin/auth/login`, {
      email,
      password
    });
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Register new admin (Super admin only)
const registerAdmin = async (adminData: AdminData, token: string): Promise<AdminResponse> => {
  try {
    const response = await authAxios(token).post('/admin/auth/register', adminData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get all admins (Super admin only)
const getAllAdmins = async (token: string): Promise<AdminResponse[]> => {
  try {
    const response = await authAxios(token).get('/admin/auth/admins');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get admin by ID (Super admin only)
const getAdminById = async (id: string, token: string): Promise<AdminResponse> => {
  try {
    const response = await authAxios(token).get(`/admin/auth/admins/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update admin (Super admin only)
const updateAdmin = async (id: string, adminData: Partial<AdminData>, token: string): Promise<AdminResponse> => {
  try {
    const response = await authAxios(token).put(`/admin/auth/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Delete admin (Super admin only)
const deleteAdmin = async (id: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await authAxios(token).delete(`/admin/auth/admins/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update profile (both admin and super admin can use this)
const updateProfile = async (profileData: Partial<AdminData>, token: string): Promise<AdminResponse> => {
  try {
    const response = await authAxios(token).put('/admin/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Change password (both admin and super admin can use this)
const changePassword = async (passwordData: PasswordChangeData, token: string): Promise<{ message: string }> => {
  try {
    const response = await authAxios(token).put('/admin/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export {
  loginSuperAdmin,
  registerAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  updateProfile,
  changePassword
}; 