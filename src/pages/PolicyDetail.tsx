import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Edit2, PlusCircle, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockPolicies, mockUsers } from '../data/mockData';
import { formatDate, getStatusColor } from '../lib/utils';

export const PolicyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const policy = mockPolicies.find(policy => policy.id === id);
  const user = mockUsers.find(user => 
    user.insurances.some(insurance => 
      insurance.policies.some(p => p.id === id)
    )
  );
  
  const insurance = user?.insurances.find(insurance => 
    insurance.policies.some(p => p.id === id)
  );

  if (!policy || !user || !insurance) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <h2 className="text-xl font-bold">Policy not found</h2>
        <p className="text-gray-500 mb-4">The policy you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/policies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/policies')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Policy Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{policy.policyNumber || 'No Policy Number'}</h2>
              <p className="text-gray-500">{insurance.insurerName}</p>
              
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(policy.status)}`}>
                  {policy.status}
                </span>
              </div>
              
              <div className="w-full border-t border-border mt-6 pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-medium">{policy.vehicle || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration</p>
                    <p className="font-medium">{policy.registration || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Policy Holder</p>
                    <p className="font-medium">{policy.policyHolder}</p>
                  </div>
                  {policy.additionalDriver && (
                    <div>
                      <p className="text-sm text-gray-500">Additional Driver</p>
                      <p className="font-medium">{policy.additionalDriver}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Coverage Period</p>
                    <p className="font-medium">
                      {formatDate(policy.coverStart)} to {formatDate(policy.coverEnd)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-6 space-y-2">
                <Button className="w-full">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <CardTitle>Documents</CardTitle>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Document Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Issued Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policy.documents.map((document) => (
                      <tr key={document.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{document.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {formatDate(document.issued)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(document.status)}`}>
                            {document.status}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};