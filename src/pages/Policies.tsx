import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, MoreVertical, Search, FilterX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { mockPolicies, mockUsers } from '../data/mockData';
import { formatDate, getStatusColor, isExpiringSoon } from '../lib/utils';
import { PolicyStatus, Insurance } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export const Policies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPolicy, currentAdmin, isSuperAdmin } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    insuranceType: '',
    insurerName: '',
    insurerClaimsLine: '',
    policyNumber: '',
    vehicle: '',
    registration: '',
    policyHolder: '',
    additionalDriver: '',
    coverStart: '',
    coverEnd: '',
  });

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.userId) {
      toast.error('Please select a user');
      return;
    }
    
    if (!formData.insuranceType || !formData.insurerName) {
      toast.error('Please enter insurance details');
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
      const success = await createPolicy({
        userId: formData.userId,
        insurance: {
          type: formData.insuranceType,
          insurerName: formData.insurerName,
          insurerClaimsLine: formData.insurerClaimsLine,
        },
        policy: {
          policyNumber: formData.policyNumber,
          vehicle: formData.vehicle,
          registration: formData.registration,
          policyHolder: formData.policyHolder,
          additionalDriver: formData.additionalDriver,
          coverStart: new Date(formData.coverStart),
          coverEnd: new Date(formData.coverEnd),
          status: PolicyStatus.ACTIVE,
        }
      });
      
      if (success) {
        setIsCreateModalOpen(false);
        setFormData({
          userId: '',
          insuranceType: '',
          insurerName: '',
          insurerClaimsLine: '',
          policyNumber: '',
          vehicle: '',
          registration: '',
          policyHolder: '',
          additionalDriver: '',
          coverStart: '',
          coverEnd: '',
        });
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get accessible users for the dropdown
  const accessibleUsers = mockUsers.filter(user => 
    isSuperAdmin || user.adminId === currentAdmin?.id || user.createdBy === currentAdmin?.id
  );

  // Get accessible policies based on user access
  const accessiblePolicies = mockPolicies.filter(policy => {
    const user = mockUsers.find(user => 
      user.insurances.some(insurance => 
        insurance.policies.some(p => p.id === policy.id)
      )
    );
    return isSuperAdmin || user?.adminId === currentAdmin?.id || user?.createdBy === currentAdmin?.id;
  });

  // Filter policies based on search term and status
  const filteredPolicies = accessiblePolicies.filter(policy => {
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
              onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value={PolicyStatus.ACTIVE}>Active</option>
              <option value={PolicyStatus.EXPIRED}>Expired</option>
              <option value={PolicyStatus.PENDING}>Pending</option>
              <option value={PolicyStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
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
                      const user = mockUsers.find(user => 
                        user.insurances.some(insurance => 
                          insurance.policies.some(p => p.id === policy.id)
                        )
                      );
                      
                      const insurance = user?.insurances.find(insurance => 
                        insurance.policies.some(p => p.id === policy.id)
                      );
                      
                      const isExpiring = isExpiringSoon(policy.coverEnd);
                      
                      return (
                        <tr key={policy.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium">{policy.policyNumber || 'No Policy Number'}</p>
                                <p className="text-gray-500">{insurance?.insurerName}</p>
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
                            {policy.additionalDriver && (
                              <p className="text-gray-500 text-xs">
                                Additional: {policy.additionalDriver}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isExpiring && policy.status === PolicyStatus.ACTIVE
                                ? 'bg-yellow-100 text-yellow-800'
                                : getStatusColor(policy.status)
                            }`}>
                              {isExpiring && policy.status === PolicyStatus.ACTIVE
                                ? 'Expiring Soon'
                                : policy.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm">{formatDate(policy.coverStart)}</p>
                            <p className="text-sm">to {formatDate(policy.coverEnd)}</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end">
                              <Link
                                to={`/policies/${policy.id}`}
                                className="px-3 py-1 text-sm font-medium text-primary hover:text-primary/80"
                              >
                                View
                              </Link>
                              <div className="relative inline-block">
                                <button className="rounded-full p-1 hover:bg-gray-100">
                                  <MoreVertical className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
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
        </CardContent>
      </Card>
      
      {/* This would be replaced with a proper modal component */}
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
                      {accessibleUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Insurance Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Type
                      </label>
                      <select
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={formData.insuranceType}
                        onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Car">Car Insurance</option>
                        <option value="Home">Home Insurance</option>
                        <option value="Life">Life Insurance</option>
                        <option value="Health">Health Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurer Name
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter insurer name"
                        value={formData.insurerName}
                        onChange={(e) => setFormData({ ...formData, insurerName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Claims Line (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter claims line number"
                      value={formData.insurerClaimsLine}
                      onChange={(e) => setFormData({ ...formData, insurerClaimsLine: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Policy Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter policy number"
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    />
                  </div>
                  {formData.insuranceType === 'Car' && (
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
                        />
                      </div>
                    </div>
                  )}
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
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Coverage Period</h4>
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
                        min={formData.coverStart}
                        required
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