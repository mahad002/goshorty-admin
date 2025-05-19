import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, FilterX, Shield, ShieldX, Clock, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatDate, isExpired, validateUsername } from '../lib/utils';
import { UserRole, UserStatus, Admin } from '../types';
import { useAuth, DEMO_ADMINS } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getToken, ALWAYS_USE_BACKEND } from '../services/service';
import { getAllAdmins, deleteAdmin as deleteAdminApi } from '../services/superadminservice';

interface AdminFormData {
  name: string;
  role: UserRole;
  expiresAt?: Date;
  password: string;
  confirmPassword: string;
}

export const AdminManagement: React.FC = () => {
  const { isSuperAdmin, createAdmin, updateAdmin, toggleAdminStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',

    role: UserRole.ADMIN,
    password: '',
    confirmPassword: '',
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  // Function to fetch admins data
  const fetchAdmins = async () => {
    if (ALWAYS_USE_BACKEND) {
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        
        const adminData = await getAllAdmins(token);
        
        // Convert backend data format to frontend format
        const formattedAdmins: Admin[] = adminData.map(admin => ({
          id: admin._id,
          name: admin.username,
     
          role: admin.role === 'superadmin' ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
          status: admin.status === 'active' ? UserStatus.ACTIVE : UserStatus.INACTIVE,
          createdAt: new Date(),
          expiresAt: admin.expirationDate ? new Date(admin.expirationDate) : undefined,
          assignedUsers: [],
        }));
        
        setAdmins(formattedAdmins);
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to load admins');
      } finally {
        setIsLoading(false);
      }
    } else {
      // In development, use mock data
      setAdmins(DEMO_ADMINS);
    }
  };

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
 
      role: admin.role,
      expiresAt: admin.expiresAt,
      password: '',
      confirmPassword: '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin) return;
    
    // Validate username
    const usernameValidation = validateUsername(formData.name);
    if (!usernameValidation.isValid) {
      toast.error(usernameValidation.message);
      return;
    }
 
    
    // Only validate password fields if a new password is being set
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }
    
    if (formData.role === UserRole.ADMIN && !formData.expiresAt) {
      toast.error('Please set an expiration date for the admin account');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Only include password in the update if it was provided
      const adminData: Partial<Omit<Admin, 'id' | 'createdAt' | 'assignedUsers'>> & { password?: string } = {
        name: formData.name.trim(), // Ensure trimmed value is sent to backend
        role: formData.role,
        expiresAt: formData.role === UserRole.ADMIN ? formData.expiresAt : undefined,
      };
      
      if (formData.password) {
        adminData.password = formData.password;
      }
      
      const success = await updateAdmin(selectedAdmin.id, adminData);
      
      if (success) {
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
        setFormData({
          name: '',
      
          role: UserRole.ADMIN,
          password: '',
          confirmPassword: '',
        });
        
        // Refresh admin list after update
        await fetchAdmins();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (admin: Admin) => {
    setIsStatusUpdating(admin.id);
    try {
      let action: 'pause' | 'activate' | 'extend';
      
      if (admin.status === UserStatus.ACTIVE) {
        action = 'pause';
      } else if (admin.status === UserStatus.PAUSED || (admin.expiresAt && isExpired(admin.expiresAt))) {
        action = admin.expiresAt ? 'extend' : 'activate';
      } else {
        action = 'activate';
      }
      
      await toggleAdminStatus(admin.id, action);
    } finally {
      setIsStatusUpdating(null);
    }
  };

  // Filter admins based on search term and role
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    const usernameValidation = validateUsername(formData.name);
    if (!usernameValidation.isValid) {
      toast.error(usernameValidation.message);
      return;
    }
    
   
    
    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.role === UserRole.ADMIN && !formData.expiresAt) {
      toast.error('Please set an expiration date for the admin account');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await createAdmin({
        name: formData.name.trim(), // Ensure trimmed value is sent to backend
        role: formData.role,
        status: UserStatus.ACTIVE,
        expiresAt: formData.role === UserRole.ADMIN ? formData.expiresAt : undefined,
        password: formData.password,
      });
      
      if (success) {
        // Reset form and close modal
        setFormData({
          name: '',
      
          role: UserRole.ADMIN,
          password: '',
          confirmPassword: '',
        });
        setIsCreateModalOpen(false);
        
        // Refresh admin list after creation
        await fetchAdmins();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Clear expiration date if switching to super admin
      expiresAt: role === UserRole.SUPER_ADMIN ? undefined : prev.expiresAt,
    }));
  };

  // Function to handle admin deletion
  const handleDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  // Function to confirm admin deletion
  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    setIsDeleting(adminToDelete.id);
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      await deleteAdminApi(adminToDelete.id, token);
      
      // Close modal first
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      
      // Refresh admin list after deletion
      await fetchAdmins();
      
      toast.success('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-gray-500">Create and manage admin accounts and their permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Admin
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
            <CardTitle>All Admins</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  className="pl-9 pr-4 py-2 w-full md:w-[250px] rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-2 top-2.5"
                    onClick={() => setSearchTerm('')}
                  >
                    <FilterX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              <select
                className="px-3 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              >
                <option value="all">All Roles</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Admin</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Expiration</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin) => {
                        const isExpired = admin.expiresAt ? new Date(admin.expiresAt) < new Date() : false;
                        
                        return (
                          <tr key={admin.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">{admin.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                admin.role === UserRole.SUPER_ADMIN 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {admin.role}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {admin.expiresAt ? (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className={isExpired ? 'text-red-500' : 'text-gray-700'}>
                                      {isExpired ? 'Expired on' : 'Expires on'} {formatDate(admin.expiresAt)}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500">No expiration</p>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditAdmin(admin)}
                                >
                                  Edit
                                </Button>
                                {admin.role !== UserRole.SUPER_ADMIN && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteAdmin(admin)}
                                    isLoading={isDeleting === admin.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No admins found. Try adjusting your search or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Create Admin Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create New Admin</h3>
              <p className="text-sm text-gray-500 mt-1">Add a new administrator to the system</p>
            </div>
            <form onSubmit={handleCreateAdmin}>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin username"
                    />
                  </div>
                  
              
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Confirm password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={formData.role === UserRole.ADMIN}
                          onChange={() => handleRoleChange(UserRole.ADMIN)}
                          className="mr-2"
                        />
                        Admin
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={formData.role === UserRole.SUPER_ADMIN}
                          onChange={() => handleRoleChange(UserRole.SUPER_ADMIN)}
                          className="mr-2"
                        />
                        Super Admin
                      </label>
                    </div>
                  </div>
                  
                  {formData.role === UserRole.ADMIN && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        value={formData.expiresAt?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          expiresAt: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Only regular admins can have an expiration date. Super admins don't expire.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Create Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Admin Modal */}
      {isEditModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Edit Admin</h3>
              <p className="text-sm text-gray-500 mt-1">Update administrator details</p>
            </div>
            <form onSubmit={handleUpdateAdmin}>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin username"
                    />
                  </div>
                  
           
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Change Password (Leave blank to keep current password)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={formData.role === UserRole.ADMIN}
                          onChange={() => handleRoleChange(UserRole.ADMIN)}
                          className="mr-2"
                        />
                        Admin
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={formData.role === UserRole.SUPER_ADMIN}
                          onChange={() => handleRoleChange(UserRole.SUPER_ADMIN)}
                          className="mr-2"
                        />
                        Super Admin
                      </label>
                    </div>
                  </div>
                  
                  {formData.role === UserRole.ADMIN && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        value={formData.expiresAt?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          expiresAt: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Only regular admins can have an expiration date. Super admins don't expire.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedAdmin(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Update Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Delete Confirmation Modal */}
      {isDeleteModalOpen && adminToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Delete Admin</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete this admin? This action cannot be undone.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{adminToDelete.name}</p>
                </div>
              </div>
            
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAdminToDelete(null);
                }}
                disabled={isDeleting !== null}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="danger"
                onClick={confirmDeleteAdmin}
                isLoading={isDeleting !== null}
              >
                Delete Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};