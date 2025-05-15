import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, PlusCircle, Search, FilterX, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockUsers } from '../data/mockData';
import { toast } from 'sonner';
import { getToken, ALWAYS_USE_BACKEND } from '../services/service';
import { getUsers, createUser as createUserApi, deleteUser as deleteUserApi, updateUser } from '../services/adminService';

interface BackendUser {
  _id: string;
  email: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  postcode: string;
  createdAt?: string;
}

interface UserFormData {
  name: string;
  surname: string;
  email: string;
  dateOfBirth: string;
  postcode: string;
}

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    surname: '',
    email: '',
    dateOfBirth: '',
    postcode: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<BackendUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<BackendUser | null>(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    if (ALWAYS_USE_BACKEND) {
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        
        const userData = await getUsers(token);
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use mock data in development
      setUsers(mockUsers.map(user => ({
        _id: user.id,
        email: user.email,
        name: user.name.split(' ')[0],
        surname: user.name.split(' ')[1] || '',
        dateOfBirth: '1990-01-01',
        postcode: user.address?.split(',').pop()?.trim() || '',
        createdAt: user.createdAt.toISOString()
      })));
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Please enter user name');
      return;
    }
    
    if (!formData.surname.trim()) {
      toast.error('Please enter user surname');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!formData.dateOfBirth) {
      toast.error('Please enter date of birth');
      return;
    }

    if (!formData.postcode.trim()) {
      toast.error('Please enter postcode');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return false;
        }
        
        await createUserApi(formData, token);
        
        // Reset form and close modal
        setFormData({
          name: '',
          surname: '',
          email: '',
          dateOfBirth: '',
          postcode: '',
        });
        
        setIsCreateModalOpen(false);
        
        // Refresh user list
        await fetchUsers();
        
        toast.success('User created successfully');
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('User created successfully (mock)');
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle user deletion
  const handleDeleteClick = (user: BackendUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Function to handle actual deletion
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        
        await deleteUserApi(userToDelete._id, token);
        
        // Close modal
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        
        // Refresh users list
        await fetchUsers();
        
        toast.success('User deleted successfully');
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('User deleted successfully (mock)');
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to handle edit click
  const handleEditClick = (user: BackendUser) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      postcode: user.postcode,
    });
    setIsEditModalOpen(true);
  };

  // Function to handle update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Please enter user name');
      return;
    }
    
    if (!formData.surname.trim()) {
      toast.error('Please enter user surname');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!formData.dateOfBirth) {
      toast.error('Please enter date of birth');
      return;
    }

    if (!formData.postcode.trim()) {
      toast.error('Please enter postcode');
      return;
    }

    if (!editUser) return;
    
    setIsSubmitting(true);
    
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        
        await updateUser(editUser._id, formData, token);
        
        // Reset form and close modal
        setFormData({
          name: '',
          surname: '',
          email: '',
          dateOfBirth: '',
          postcode: '',
        });
        
        setIsEditModalOpen(false);
        setEditUser(null);
        
        // Refresh user list
        await fetchUsers();
        
        toast.success('User updated successfully');
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('User updated successfully (mock)');
        setIsEditModalOpen(false);
        setEditUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.name} ${user.surname}`;
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-500">Manage user accounts and their insurance policies</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle>All Users</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date of Birth</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Postcode</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium">{`${user.name} ${user.surname}`}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-gray-500">{user.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p>{user.dateOfBirth}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p>{user.postcode}</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              
                              <button
                                onClick={() => handleEditClick(user)}
                                className="text-sm font-medium p-2 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="text-sm font-medium p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No users found. Try adjusting your search or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg my-8">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create New User</h3>
              <p className="text-sm text-gray-500 mt-1">Add a new user to the system</p>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter user's first name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter user's surname"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter user's email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter postcode"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      required
                    />
                  </div>
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
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Delete User</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{`${userToDelete.name} ${userToDelete.surname}`}</p>
                  <p className="text-gray-500">{userToDelete.email}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="danger"
                onClick={confirmDeleteUser}
                isLoading={isDeleting}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg my-8">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <p className="text-sm text-gray-500 mt-1">Update user details</p>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter user's first name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter user's surname"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter user's email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter postcode"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditUser(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Update User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};