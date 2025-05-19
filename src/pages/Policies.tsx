import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, MoreVertical, Search, FilterX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { mockPolicies, mockUsers } from '../data/mockData';
import { formatDate, getStatusColor, isExpiringSoon } from '../lib/utils';
import { PolicyStatus } from '../types';
import { toast } from 'sonner';
import { getToken, ALWAYS_USE_BACKEND } from '../services/service';
import { getPolicies, getUsers, createPolicy as createPolicyApi } from '../services/adminService';

interface BackendPolicy {
  _id: string;
  policyNumber: string;
  user: string | BackendUser;
  vehicle: string;
  registration: string;
  coverStart: string;
  coverEnd: string;
  status: string;
  policyHolder: string;
  additionalDriver: string;
  insurerName: string;
  insurerClaimsLine: string;
  totalPaid?: number;
  insurancePremium?: number;
  administrationFee?: number;
  iptTax?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendUser {
  _id: string;
  email: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  postcode: string;
}

interface DocumentData {
  name: string;
  issued: string;
  status: string;
}

export const Policies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Live' | 'Expired'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [policies, setPolicies] = useState<BackendPolicy[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    vehicle: '',
    registration: '',
    policyHolder: '',
    additionalDriver: '',
    coverStart: '',
    coverEnd: '',
    totalPaid: '',
    insurancePremium: '',
    administrationFee: '',
    iptTax: ''
  });

  // Fetch policies and users from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (ALWAYS_USE_BACKEND) {
          const token = getToken();
          if (!token) {
            toast.error('Authentication required');
            return;
          }
          
          // Fetch policies
          const policiesData = await getPolicies(token);
          setPolicies(policiesData);
          
          // Fetch users for the dropdown in create policy form
          const usersData = await getUsers(token);
          setUsers(usersData);
        } else {
          // Use mock data in development
          const mockPoliciesData = mockPolicies.map(policy => {
            const user = mockUsers.find(user => 
              user.insurances.some(insurance => 
                insurance.policies.some(p => p.id === policy.id)
              )
            );
            
            const insurance = user?.insurances.find(insurance => 
              insurance.policies.some(p => p.id === policy.id)
            );
            
            return {
              _id: policy.id,
              policyNumber: policy.policyNumber || '',
              user: {
                _id: user?.id || '',
                email: user?.email || '',
                name: user?.name.split(' ')[0] || '',
                surname: user?.name.split(' ')[1] || '',
                dateOfBirth: '1990-01-01',
                postcode: '',
              },
              vehicle: policy.vehicle || '',
              registration: policy.registration || '',
              coverStart: policy.coverStart.toISOString(),
              coverEnd: policy.coverEnd.toISOString(),
              status: policy.status === PolicyStatus.ACTIVE ? 'Live' : 'Expired',
              policyHolder: policy.policyHolder,
              additionalDriver: policy.additionalDriver || 'None',
              insurerName: insurance?.insurerName || 'Unknown',
              insurerClaimsLine: '0800 123 4567',
            };
          });
          
          setPolicies(mockPoliciesData);
          
          setUsers(mockUsers.map(user => ({
            _id: user.id,
            email: user.email,
            name: user.name.split(' ')[0],
            surname: user.name.split(' ')[1] || '',
            dateOfBirth: '1990-01-01',
            postcode: user.address?.split(',').pop()?.trim() || '',
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load policies');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.userId) {
      toast.error('Please select a user');
      return;
    }
    
    if (!formData.policyHolder) {
      toast.error('Please enter policy holder name');
      return;
    }
    
    if (!formData.coverStart || !formData.coverEnd) {
      toast.error('Please set coverage dates');
      return;
    }
    
    if (new Date(formData.coverEnd) <= new Date(formData.coverStart)) {
      toast.error('Cover end date must be after start date');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (ALWAYS_USE_BACKEND) {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        
        // Format data for backend
        const policyData = {
          user: formData.userId,
          vehicle: formData.vehicle,
          registration: formData.registration,
          coverStart: formData.coverStart,
          coverEnd: formData.coverEnd,
          status: 'Live', // New policies start as live
          policyHolder: formData.policyHolder,
          additionalDriver: formData.additionalDriver || 'None',
          totalPaid: formData.totalPaid ? parseFloat(formData.totalPaid) : undefined,
          insurancePremium: formData.insurancePremium ? parseFloat(formData.insurancePremium) : undefined,
          administrationFee: formData.administrationFee ? parseFloat(formData.administrationFee) : undefined,
          iptTax: formData.iptTax ? parseFloat(formData.iptTax) : undefined
        };
        
        await createPolicyApi(policyData, token);
        
        // Reset form and close modal
        setFormData({
          userId: '',
          vehicle: '',
          registration: '',
          policyHolder: '',
          additionalDriver: '',
          coverStart: '',
          coverEnd: '',
          totalPaid: '',
          insurancePremium: '',
          administrationFee: '',
          iptTax: ''
        });
        
        setIsCreateModalOpen(false);
        
        // Refresh policies
        const policiesData = await getPolicies(token);
        setPolicies(policiesData);
        
        toast.success('Policy created successfully');
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Policy created successfully (mock)');
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter policies based on search term and status
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.registration?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
          <p className="text-gray-500">Manage insurance policies and their documents</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle>All Policies</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search policies..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Live' | 'Expired')}
            >
              <option value="all">All Status</option>
              <option value="Live">Live</option>
              <option value="Expired">Expired</option>
            </select>
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
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Policy Details</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Vehicle/Property</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Policy Holder</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Coverage</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPolicies.length > 0 ? (
                      filteredPolicies.map((policy) => {
                        const userName = typeof policy.user === 'string' 
                          ? 'User' 
                          : `${policy.user.name} ${policy.user.surname}`;
                        
                        const isExpiring = policy.coverEnd 
                          ? isExpiringSoon(new Date(policy.coverEnd)) 
                          : false;
                        
                        return (
                          <tr key={policy._id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">{policy.policyNumber || 'No Policy Number'}</p>
                                  <p className="text-gray-500">{policy.insurerName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p>{policy.vehicle || '-'}</p>
                              <p className="text-gray-500 text-xs">
                                {policy.registration ? `Reg: ${policy.registration}` : '-'}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p>{policy.policyHolder}</p>
                              {policy.additionalDriver && policy.additionalDriver !== 'None' && (
                                <p className="text-gray-500 text-xs">
                                  Additional: {policy.additionalDriver}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                isExpiring && policy.status === 'Live'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : policy.status === 'Live' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {isExpiring && policy.status === 'Live'
                                  ? 'Expiring Soon'
                                  : policy.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm">{formatDate(new Date(policy.coverStart))}</p>
                              <p className="text-sm">to {formatDate(new Date(policy.coverEnd))}</p>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end">
                                <Link
                                  to={`/policies/${policy._id}`}
                                  className="px-3 py-1 text-sm font-medium text-primary hover:text-primary/80"
                                >
                                  View
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No policies found. Try adjusting your search or filters.
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
      
      {/* Create Policy Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create New Policy</h3>
              <p className="text-sm text-gray-500 mt-1">Add a new insurance policy for a user</p>
            </div>
            <form onSubmit={handleCreatePolicy}>
              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">User Selection</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select User
                    </label>
                    <select
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} {user.surname} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Policy Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter vehicle details"
                        value={formData.vehicle}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter registration"
                        value={formData.registration}
                        onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Holder
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter policy holder name"
                      value={formData.policyHolder}
                      onChange={(e) => setFormData({ ...formData, policyHolder: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Driver (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter additional driver name"
                      value={formData.additionalDriver}
                      onChange={(e) => setFormData({ ...formData, additionalDriver: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formData.coverStart}
                        onChange={(e) => setFormData({ ...formData, coverStart: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover End Date
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formData.coverEnd}
                        onChange={(e) => setFormData({ ...formData, coverEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Financial Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Paid (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter total amount paid"
                        value={formData.totalPaid}
                        onChange={(e) => setFormData({ ...formData, totalPaid: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Premium (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter insurance premium"
                        value={formData.insurancePremium}
                        onChange={(e) => setFormData({ ...formData, insurancePremium: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Administration Fee (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter admin fee"
                        value={formData.administrationFee}
                        onChange={(e) => setFormData({ ...formData, administrationFee: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IPT Tax (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter IPT tax amount"
                        value={formData.iptTax}
                        onChange={(e) => setFormData({ ...formData, iptTax: e.target.value })}
                      />
                    </div>
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
                  Create Policy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};