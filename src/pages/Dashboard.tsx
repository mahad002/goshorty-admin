import React, { useState, useEffect } from 'react';
import { Users, FileText, FileUp, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockPolicies, mockUsers } from '../data/mockData';
import { formatDate, isExpiringSoon } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { Policy, PolicyStatus } from '../types';
import { getToken, ALWAYS_USE_BACKEND } from '../services/service';
import { getPolicyCounts, getUsers, getPolicies, getDashboardStats } from '../services/adminService';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { currentAdmin, isSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPolicies: 0,
    expiredPolicies: 0,
    totalDocuments: 0
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        if (ALWAYS_USE_BACKEND) {
          const token = getToken();
          if (!token) {
            toast.error('Authentication required');
            return;
          }
          
          // Get all dashboard stats in one call
          const dashboardStats = await getDashboardStats(token);
          
          // Get policy counts for expired policies count
          const policyCounts = await getPolicyCounts(token);
          
          setStats({
            totalUsers: dashboardStats.userCount,
            totalPolicies: dashboardStats.policyCount,
            expiredPolicies: policyCounts.expiredCount,
            totalDocuments: dashboardStats.documentCount
          });
        } else {
          // Use mock data in development
          setStats({
            totalUsers: mockUsers.length,
            totalPolicies: mockPolicies.length,
            expiredPolicies: mockPolicies.filter(policy => policy.status === PolicyStatus.EXPIRED).length,
            totalDocuments: mockPolicies.reduce((sum, policy) => sum + policy.documents.length, 0)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {currentAdmin?.name}!
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Users"
            value={stats.totalUsers}
            description="Active user accounts"
            icon={<Users className="h-5 w-5" />}
            iconColor="bg-blue-100 text-blue-600"
          />
          <DashboardCard
            title="Total Policies"
            value={stats.totalPolicies}
            description="Insurance policies"
            icon={<FileText className="h-5 w-5" />}
            iconColor="bg-green-100 text-green-600"
          />
          <DashboardCard
            title="Expired Policies"
            value={stats.expiredPolicies}
            description="Policies ended"
            icon={<AlertTriangle className="h-5 w-5" />}
            iconColor="bg-red-100 text-red-600"
          />
          <DashboardCard
            title="Documents"
            value={stats.totalDocuments}
            description="Uploaded documents"
            icon={<FileUp className="h-5 w-5" />}
            iconColor="bg-purple-100 text-purple-600"
          />
        </div>
      )}
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




