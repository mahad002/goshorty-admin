import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Edit2, PlusCircle, Download, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockPolicies, mockUsers } from '../data/mockData';
import { formatDate, getStatusColor } from '../lib/utils';
import { getToken, ALWAYS_USE_BACKEND } from '../services/service';
import { getPolicyById, uploadDocument, getDocumentDownloadUrl, updatePolicy, deletePolicy as deletePolicyApi } from '../services/adminService';
import { toast } from 'sonner';

interface Document {
  _id: string;
  name: string;
  policyId: string;
  s3Key: string;
  s3Url: string;
  issued: string;
  status: string;
}

interface Policy {
  _id: string;
  policyNumber: string;
  user: any;
  vehicle: string;
  registration: string;
  coverStart: string;
  coverEnd: string;
  status: string;
  policyHolder: string;
  additionalDriver: string;
  insurerName: string;
  insurerClaimsLine: string;
}

export const PolicyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [documentData, setDocumentData] = useState({
    name: '',
    issued: new Date().toISOString().split('T')[0],
    status: 'New'
  });
  
  const [editData, setEditData] = useState<Partial<Policy>>({
    policyNumber: '',
    vehicle: '',
    registration: '',
    coverStart: '',
    coverEnd: '',
    status: '',
    policyHolder: '',
    additionalDriver: '',
    insurerName: '',
    insurerClaimsLine: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        if (ALWAYS_USE_BACKEND) {
          const token = getToken();
          if (!token) {
            toast.error('Authentication required');
            navigate('/login');
            return;
          }
          
          const response = await getPolicyById(id, token);
          setPolicy(response.policy);
          setDocuments(response.documents || []);
          
          // Initialize the edit form data
          setEditData({
            policyNumber: response.policy.policyNumber,
            vehicle: response.policy.vehicle,
            registration: response.policy.registration,
            coverStart: response.policy.coverStart,
            coverEnd: response.policy.coverEnd,
            status: response.policy.status,
            policyHolder: response.policy.policyHolder,
            additionalDriver: response.policy.additionalDriver,
            insurerName: response.policy.insurerName,
            insurerClaimsLine: response.policy.insurerClaimsLine
          });
        } else {
          // Mock implementation would go here
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching policy details:', error);
        toast.error('Failed to load policy details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPolicyDetails();
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!documentData.name.trim()) {
      toast.error('Please enter a document name');
      return;
    }
    
    if (!policy || !id) return;
    
    setIsUploading(true);
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('name', documentData.name);
      formData.append('issued', documentData.issued);
      formData.append('status', documentData.status);
      
      const newDocument = await uploadDocument(id, formData, token);
      
      // Update documents list
      setDocuments(prev => [...prev, newDocument]);
      
      // Reset form
      setDocumentData({
        name: '',
        issued: new Date().toISOString().split('T')[0],
        status: 'New'
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setIsUploadModalOpen(false);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const { downloadUrl } = await getDocumentDownloadUrl(documentId, token);
      
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
      
      // Removed: Don't update document status when admin downloads
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };
  
  const handleEditPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!policy || !id) return;
    
    // Validate form data
    if (!editData.policyNumber?.trim()) {
      toast.error('Please enter policy number');
      return;
    }
    
    if (!editData.insurerName?.trim()) {
      toast.error('Please enter insurer name');
      return;
    }
    
    if (!editData.policyHolder?.trim()) {
      toast.error('Please enter policy holder name');
      return;
    }
    
    if (!editData.coverStart || !editData.coverEnd) {
      toast.error('Please set coverage dates');
      return;
    }
    
    if (new Date(editData.coverEnd) <= new Date(editData.coverStart)) {
      toast.error('Cover end date must be after start date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const updatedPolicy = await updatePolicy(id, editData, token);
      
      // Update policy in state
      setPolicy(prevPolicy => ({ ...prevPolicy!, ...updatedPolicy }));
      
      setIsEditModalOpen(false);
      toast.success('Policy updated successfully');
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePolicy = async () => {
    if (!policy || !id) return;
    
    setIsDeleting(true);
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      await deletePolicyApi(id, token);
      
      toast.success('Policy deleted successfully');
      navigate('/policies');
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!policy) {
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
              <p className="text-gray-500">{policy.insurerName}</p>
              
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  policy.status === 'Live' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
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
                  {policy.additionalDriver && policy.additionalDriver !== 'None' && (
                    <div>
                      <p className="text-sm text-gray-500">Additional Driver</p>
                      <p className="font-medium">{policy.additionalDriver}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Coverage Period</p>
                    <p className="font-medium">
                      {formatDate(new Date(policy.coverStart))} to {formatDate(new Date(policy.coverEnd))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Claims Line</p>
                    <p className="font-medium">{policy.insurerClaimsLine}</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-6 space-y-2">
                <Button className="w-full" onClick={() => setIsEditModalOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Policy
                </Button>
                <Button 
                  className="w-full" 
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <CardTitle>Documents</CardTitle>
            <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
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
                      {documents.map((document) => (
                        <tr key={document._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-2" />
                              <span>{document.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {formatDate(new Date(document.issued))}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              document.status === 'New' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {document.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(document._id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm">
                  This policy doesn't have any documents. Upload a document to get started.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <p className="text-sm text-gray-500 mt-1">Add a document to this policy</p>
            </div>
            <form onSubmit={handleUploadDocument}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter document name"
                    value={documentData.name}
                    onChange={(e) => setDocumentData({ ...documentData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={documentData.issued}
                      onChange={(e) => setDocumentData({ ...documentData, issued: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    onChange={handleFileChange}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Max file size: 5MB. Accepted formats: PDF, DOC, DOCX, JPG, PNG
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isUploading}>
                  Upload Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Edit Policy</h3>
              <p className="text-sm text-gray-500 mt-1">Update policy details</p>
            </div>
            <form onSubmit={handleEditPolicy}>
              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                      value={editData.policyNumber}
                      onChange={(e) => setEditData({ ...editData, policyNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter vehicle details"
                        value={editData.vehicle}
                        onChange={(e) => setEditData({ ...editData, vehicle: e.target.value })}
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
                        value={editData.registration}
                        onChange={(e) => setEditData({ ...editData, registration: e.target.value })}
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
                      value={editData.policyHolder}
                      onChange={(e) => setEditData({ ...editData, policyHolder: e.target.value })}
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
                      value={editData.additionalDriver}
                      onChange={(e) => setEditData({ ...editData, additionalDriver: e.target.value })}
                    />
                  </div>

                  <h4 className="text-sm font-medium text-gray-900 pt-4">Insurance Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurer Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter insurer name"
                      value={editData.insurerName}
                      onChange={(e) => setEditData({ ...editData, insurerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Claims Line 
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter claims line number"
                      value={editData.insurerClaimsLine}
                      onChange={(e) => setEditData({ ...editData, insurerClaimsLine: e.target.value })}
                    />
                  </div>

                  <h4 className="text-sm font-medium text-gray-900 pt-4">Status & Dates</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      required
                    >
                      <option value="Live">Live</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={editData.coverStart}
                        onChange={(e) => setEditData({ ...editData, coverStart: e.target.value })}
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
                        value={editData.coverEnd}
                        onChange={(e) => setEditData({ ...editData, coverEnd: e.target.value })}
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
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Update Policy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Policy Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Delete Policy</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete this policy? This action cannot be undone.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{policy.policyNumber}</p>
                  <p className="text-gray-500">{policy.insurerName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This will permanently delete the policy and all associated documents. Documents stored on the server will also be removed.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="danger"
                onClick={handleDeletePolicy}
                isLoading={isDeleting}
              >
                Delete Policy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};