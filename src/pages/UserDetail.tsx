import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Edit2, PlusCircle, MoreVertical, Shield, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockAdmins, mockUsers } from '../data/mockData';
import { formatDate, getStatusColor } from '../lib/utils';
import { Policy, PolicyStatus } from '../types';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find user in mock data
  const user = mockUsers.find(user => user.id === id);
  const admin = user?.adminId ? mockAdmins.find(admin => admin.id === user.adminId) : undefined;
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'details' | 'policies' | 'documents'>('details');
  
  // If user not found
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="text-gray-500 mb-4">The user you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
              
              <div className="w-full border-t border-border mt-6 pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{user.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Managed By</p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="font-medium">{admin?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-6 space-y-2">
                <Button className="w-full">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b p-4">
              <div className="flex space-x-1">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'details'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Insurance Details
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'policies'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('policies')}
                >
                  Policies
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'documents'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {activeTab === 'details' && (
                <InsuranceDetailsTab user={user} />
              )}
              
              {activeTab === 'policies' && (
                <PoliciesTab user={user} />
              )}
              
              {activeTab === 'documents' && (
                <DocumentsTab user={user} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InsuranceDetailsTab: React.FC<{ user: typeof mockUsers[0] }> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Insurance Overview</h3>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Insurance
        </Button>
      </div>
      
      {user.insurances.length > 0 ? (
        <div className="space-y-4">
          {user.insurances.map((insurance) => (
            <Card key={insurance.id} className="overflow-hidden">
              <div className="bg-primary/5 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{insurance.type} Insurance</h4>
                    <p className="text-sm text-gray-500">{insurance.insurerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {insurance.policies.length} {insurance.policies.length === 1 ? 'policy' : 'policies'}
                  </span>
                  <button className="rounded-full p-1 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {insurance.policies.map((policy) => (
                    <div key={policy.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{policy.vehicle || policy.policyNumber}</p>
                        <p className="text-sm text-gray-500">
                          {policy.registration && `Reg: ${policy.registration}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={policy.status === PolicyStatus.ACTIVE ? "success" : "error"}>
                          {policy.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {formatDate(policy.coverEnd)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No insurances found for this user.</p>
          <Button className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add First Insurance
          </Button>
        </div>
      )}
    </div>
  );
};

const PoliciesTab: React.FC<{ user: typeof mockUsers[0] }> = ({ user }) => {
  // Get all policies from all insurances
  const allPolicies = user.insurances.flatMap(insurance => insurance.policies);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Policies</h3>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>
      
      {allPolicies.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Policy Details</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vehicle/Property</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Provider</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Coverage</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPolicies.map((policy) => {
                const insurance = user.insurances.find(ins => ins.id === policy.insuranceId);
                return (
                  <tr key={policy.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium">{policy.policyNumber || '-'}</p>
                      <p className="text-xs text-gray-500">
                        Holder: {policy.policyHolder}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{policy.vehicle || '-'}</p>
                      <p className="text-xs text-gray-500">
                        {policy.registration || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{insurance?.insurerName}</p>
                      <p className="text-xs text-gray-500">
                        {insurance?.type} Insurance
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{formatDate(policy.coverStart)}</p>
                      <p className="text-sm">to {formatDate(policy.coverEnd)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No policies found for this user.</p>
          <Button className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add First Policy
          </Button>
        </div>
      )}
    </div>
  );
};

const DocumentsTab: React.FC<{ user: typeof mockUsers[0] }> = ({ user }) => {
  // Get all documents from all policies
  const allDocuments = user.insurances
    .flatMap(insurance => insurance.policies)
    .flatMap(policy => policy.documents.map(doc => ({ ...doc, policy })));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Documents</h3>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      {allDocuments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Document Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Related Policy</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Issued Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allDocuments.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium">{doc.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{doc.policy.policyNumber || doc.policy.vehicle}</p>
                    <p className="text-xs text-gray-500">
                      {doc.policy.registration || doc.policy.policyHolder}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(doc.issued)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No documents found for this user.</p>
          <Button className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Upload First Document
          </Button>
        </div>
      )}
    </div>
  );
};