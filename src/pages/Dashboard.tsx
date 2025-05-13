import React from 'react';
import { Users, FileText, FileUp, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockPolicies, mockUsers } from '../data/mockData';
import { formatDate, isExpiringSoon } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { Policy, PolicyStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { currentAdmin, isSuperAdmin } = useAuth();
  
  // Count stats based on mock data
  const totalUsers = mockUsers.length;
  const totalPolicies = mockPolicies.length;
  const expiredPolicies = mockPolicies.filter(
    (policy) => policy.status === PolicyStatus.EXPIRED
  ).length;
  
  // Find policies that are expiring soon (within 30 days)
  const expiringSoonPolicies = mockPolicies.filter(
    (policy) => policy.status === PolicyStatus.ACTIVE && isExpiringSoon(policy.coverEnd, 30)
  );
  
  // Calculate missing documents (policies that don't have all required document types)
  const requiredDocuments = ['Certificate of insurance', 'Policy schedule', 'Statement of fact'];
  const policiesWithMissingDocs = mockPolicies.filter(policy => {
    const documentNames = policy.documents.map(doc => doc.name);
    return !requiredDocuments.every(docName => documentNames.includes(docName));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {currentAdmin?.name}!
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Users"
          value={totalUsers}
          description="Active user accounts"
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <DashboardCard
          title="Total Policies"
          value={totalPolicies}
          description="Insurance policies"
          icon={<FileText className="h-5 w-5" />}
          iconColor="bg-green-100 text-green-600"
        />
        <DashboardCard
          title="Documents"
          value={mockPolicies.reduce((sum, policy) => sum + policy.documents.length, 0)}
          description="Uploaded documents"
          icon={<FileUp className="h-5 w-5" />}
          iconColor="bg-purple-100 text-purple-600"
        />
        <DashboardCard
          title="Expired Policies"
          value={expiredPolicies}
          description="Policies that have expired"
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="bg-red-100 text-red-600"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Policies Expiring Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringSoonPolicies.length > 0 ? (
              <div className="space-y-4">
                {expiringSoonPolicies.map((policy) => (
                  <ExpiringPolicyRow key={policy.id} policy={policy} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-2">No policies expiring soon.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Missing Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {policiesWithMissingDocs.length > 0 ? (
              <div className="space-y-4">
                {policiesWithMissingDocs.map((policy) => (
                  <MissingDocumentsRow key={policy.id} policy={policy} requiredDocs={requiredDocuments} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-2">No policies with missing documents.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon,
  iconColor,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h2 className="text-3xl font-bold mt-1">{value}</h2>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ExpiringPolicyRowProps {
  policy: Policy;
}

const ExpiringPolicyRow: React.FC<ExpiringPolicyRowProps> = ({ policy }) => {
  const user = mockUsers.find(user => 
    user.insurances.some(insurance => insurance.policies.some(p => p.id === policy.id))
  );
  
  const insurance = user?.insurances.find(insurance => 
    insurance.policies.some(p => p.id === policy.id)
  );
  
  const daysRemaining = Math.ceil(
    (new Date(policy.coverEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{policy.policyHolder}</p>
        <p className="text-sm text-gray-500">
          {policy.vehicle} - {insurance?.insurerName}
        </p>
      </div>
      <div className="text-right">
        <Badge variant={daysRemaining <= 7 ? "error" : "warning"}>
          {daysRemaining} days remaining
        </Badge>
        <p className="text-xs text-gray-500 mt-1">Expires: {formatDate(policy.coverEnd)}</p>
      </div>
    </div>
  );
};

interface MissingDocumentsRowProps {
  policy: Policy;
  requiredDocs: string[];
}

const MissingDocumentsRow: React.FC<MissingDocumentsRowProps> = ({ policy, requiredDocs }) => {
  const user = mockUsers.find(user => 
    user.insurances.some(insurance => insurance.policies.some(p => p.id === policy.id))
  );
  
  const insurance = user?.insurances.find(insurance => 
    insurance.policies.some(p => p.id === policy.id)
  );
  
  const documentNames = policy.documents.map(doc => doc.name);
  const missingDocs = requiredDocs.filter(docName => !documentNames.includes(docName));
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{policy.policyHolder}</p>
        <p className="text-sm text-gray-500">
          {policy.vehicle} - {insurance?.insurerName}
        </p>
      </div>
      <div className="text-right">
        <Badge variant="error">
          {missingDocs.length} missing
        </Badge>
        <p className="text-xs text-gray-500 mt-1">
          Missing: {missingDocs.join(', ')}
        </p>
      </div>
    </div>
  );
};