import React, { useState } from 'react';
import { FileText, PlusCircle, Search, FilterX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockPolicies } from '../data/mockData';
import { formatDate, getStatusColor } from '../lib/utils';
import { DocumentStatus } from '../types';

export const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  
  // Get all documents from all policies
  const allDocuments = mockPolicies.flatMap(policy => 
    policy.documents.map(doc => ({
      ...doc,
      policy
    }))
  );
  
  // Filter documents based on search term and status
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.policy.policyHolder.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-gray-500">Manage and track all policy documents</p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle>All Documents</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search documents..."
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
              onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value={DocumentStatus.NEW}>New</option>
              <option value={DocumentStatus.DOWNLOADED}>Downloaded</option>
              <option value={DocumentStatus.VIEWED}>Viewed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Document</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Related Policy</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Issued Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">{doc.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p>{doc.policy.policyNumber || doc.policy.vehicle}</p>
                          <p className="text-gray-500 text-xs">
                            {doc.policy.policyHolder}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No documents found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};