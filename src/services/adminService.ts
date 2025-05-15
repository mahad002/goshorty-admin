import axios from 'axios';
import { API_URL, authAxios, handleApiError } from './service';

// User interfaces
interface UserData {
  email: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  postcode: string;
}

interface UserResponse {
  _id: string;
  email: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  postcode: string;
}

// Policy interfaces
interface PolicyData {
  policyNumber: string;
  user: string;
  vehicle: string;
  registration: string;
  coverStart: string;
  coverEnd: string;
  status: string;
  policyHolder: string;
  additionalDriver?: string;
  insurerName: string;
  insurerClaimsLine: string;
}

interface DocumentData {
  name: string;
  issued: string;
  status: string;
}

interface Document {
  _id: string;
  name: string;
  policyId: string;
  s3Key: string;
  s3Url: string;
  issued: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PolicyResponse {
  _id: string;
  policyNumber: string;
  user: string | UserResponse;
  vehicle: string;
  registration: string;
  coverStart: string;
  coverEnd: string;
  status: string;
  policyHolder: string;
  additionalDriver: string;
  insurerName: string;
  insurerClaimsLine: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PolicyDetailResponse {
  policy: PolicyResponse;
  documents: Document[];
}

interface PolicyCountsResponse {
  liveCount: number;
  expiredCount: number;
  totalCount: number;
}

// Dashboard
interface DashboardStatsResponse {
  userCount: number;
  policyCount: number;
  documentCount: number;
}

// User Management (Admin only)
const getUsers = async (token: string): Promise<UserResponse[]> => {
  try {
    const response = await authAxios(token).get('/users');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const getUserById = async (id: string, token: string): Promise<UserResponse> => {
  try {
    const response = await authAxios(token).get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const createUser = async (userData: UserData, token: string): Promise<UserResponse> => {
  try {
    const response = await authAxios(token).post('/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const updateUser = async (id: string, userData: Partial<UserData>, token: string): Promise<UserResponse> => {
  try {
    const response = await authAxios(token).put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const deleteUser = async (id: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await authAxios(token).delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Policy Management (Admin only)
const getPolicies = async (token: string): Promise<PolicyResponse[]> => {
  try {
    const response = await authAxios(token).get('/policies');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const getPolicyById = async (id: string, token: string): Promise<PolicyResponse> => {
  try {
    const response = await authAxios(token).get(`/policies/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const createPolicy = async (policyData: PolicyData, token: string): Promise<PolicyResponse> => {
  try {
    const response = await authAxios(token).post('/policies', policyData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const updatePolicy = async (id: string, policyData: Partial<PolicyData>, token: string): Promise<PolicyResponse> => {
  try {
    const response = await authAxios(token).put(`/policies/${id}`, policyData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const deletePolicy = async (id: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await authAxios(token).delete(`/policies/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const addDocumentToPolicy = async (policyId: string, documentData: DocumentData, token: string): Promise<PolicyResponse> => {
  try {
    const response = await authAxios(token).post(`/policies/${policyId}/documents`, documentData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const getPolicyCounts = async (token: string): Promise<PolicyCountsResponse> => {
  try {
    const response = await authAxios(token).get('/policies/counts');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Document Management
const uploadDocument = async (policyId: string, documentFormData: FormData, token: string): Promise<Document> => {
  try {
    const response = await authAxios(token).post(`/policies/${policyId}/documents`, documentFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const getPolicyDocuments = async (policyId: string, token: string): Promise<Document[]> => {
  try {
    const response = await authAxios(token).get(`/policies/${policyId}/documents`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

const getDocumentDownloadUrl = async (documentId: string, token: string): Promise<{ downloadUrl: string }> => {
  try {
    const response = await authAxios(token).get(`/policies/documents/${documentId}/download`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Dashboard
const getDashboardStats = async (token: string): Promise<DashboardStatsResponse> => {
  try {
    const response = await authAxios(token).get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export {
  // User operations
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  
  // Policy operations
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  addDocumentToPolicy,
  getPolicyCounts,
  
  // Document operations
  uploadDocument,
  getPolicyDocuments,
  getDocumentDownloadUrl,
  
  // Dashboard operations
  getDashboardStats
}; 