import React, { useState } from 'react';
import { PlusCircle, Search, FilterX, Shield, ShieldX, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockUsers } from '../data/mockData';
import { formatDate, getStatusColor, isExpired, validateEmail } from '../lib/utils';
import { UserRole, UserStatus, Admin } from '../types';
import { useAuth, DEMO_ADMINS } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AdminFormData {
  name: string;
  email: string;
  role: UserRole;
  expiresAt?: Date;
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
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    role: UserRole.ADMIN,
  });

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      expiresAt: admin.expiresAt,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin) return;
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Please enter admin name');
      return;
    }
    
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (formData.role === UserRole.ADMIN && !formData.expiresAt) {
      toast.error('Please set an expiration date for the admin account');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await updateAdmin(selectedAdmin.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        expiresAt: formData.role === UserRole.ADMIN ? formData.expiresAt : undefined,
      });
      
      if (success) {
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
        setFormData({
          name: '',
          email: '',
          role: UserRole.ADMIN,
        });
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
  const filteredAdmins = DEMO_ADMINS.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Please enter admin name');
      return;
    }
    
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (formData.role === UserRole.ADMIN && !formData.expiresAt) {
      toast.error('Please set an expiration date for the admin account');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await createAdmin({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: UserStatus.ACTIVE,
        expiresAt: formData.role === UserRole.ADMIN ? formData.expiresAt : undefined,
      });
      
      if (success) {
        // Reset form and close modal
        setFormData({
          name: '',
          email: '',
          role: UserRole.ADMIN,
        });
        setIsCreateModalOpen(false);
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

  // Check if user should have access to this page
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <ShieldX className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-gray-500 max-w-md text-center mt-2">
          This page is only accessible to Super Admins. Please contact a Super Admin if you need access.
        </p>
      </div>
    );
  }

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
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Users</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Expiration</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => {
                      const assignedUserCount = mockUsers.filter(user => user.adminId === admin.id).length;
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
                                <p className="text-gray-500">{admin.email}</p>
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
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isExpired 
                                ? 'bg-red-100 text-red-800'
                                : getStatusColor(admin.status)
                            }`}>
                              {isExpired ? 'Expired' : admin.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">{assignedUserCount}</p>
                              <p className="text-gray-500 text-xs">assigned users</p>
                            </div>
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
                                variant={admin.status === UserStatus.ACTIVE ? 'outline' : 'primary'}
                                size="sm"
                                onClick={() => handleStatusToggle(admin)}
                                isLoading={isStatusUpdating === admin.id}
                              >
                                {admin.status === UserStatus.ACTIVE 
                                  ? 'Pause Account' 
                                  : admin.expiresAt && isExpired(admin.expiresAt)
                                    ? 'Extend Access'
                                    : 'Activate Account'}
                              </Button>
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditAdmin(admin)}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
      
      {/* This would be replaced with a proper modal component */}
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
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin email"
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
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter admin email"
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
    </div>
  );
};