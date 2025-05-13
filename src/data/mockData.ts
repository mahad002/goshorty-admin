import { Admin, Document, DocumentStatus, Insurance, Policy, PolicyStatus, User, UserRole, UserStatus } from '../types';

export const mockAdmins: Admin[] = [
  // Admin data moved to AuthContext for demo credentials
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    policyId: '1',
    name: 'Certificate of insurance',
    issued: new Date('2024-11-18T21:00:27'),
    status: DocumentStatus.DOWNLOADED,
    url: 'https://example.com/docs/certificate1.pdf',
  },
  {
    id: '2',
    policyId: '1',
    name: 'Policy schedule',
    issued: new Date('2024-11-18T21:00:27'),
    status: DocumentStatus.NEW,
    url: 'https://example.com/docs/schedule1.pdf',
  },
  {
    id: '3',
    policyId: '1',
    name: 'Statement of fact',
    issued: new Date('2024-11-18T21:00:27'),
    status: DocumentStatus.NEW,
    url: 'https://example.com/docs/statement1.pdf',
  },
  {
    id: '4',
    policyId: '2',
    name: 'Certificate of insurance',
    issued: new Date('2024-10-05T14:30:15'),
    status: DocumentStatus.DOWNLOADED,
    url: 'https://example.com/docs/certificate2.pdf',
  },
  {
    id: '5',
    policyId: '2',
    name: 'Policy schedule',
    issued: new Date('2024-10-05T14:30:15'),
    status: DocumentStatus.VIEWED,
    url: 'https://example.com/docs/schedule2.pdf',
  },
  {
    id: '6',
    policyId: '3',
    name: 'Certificate of insurance',
    issued: new Date('2024-09-20T09:15:42'),
    status: DocumentStatus.NEW,
    url: 'https://example.com/docs/certificate3.pdf',
  },
];

export const mockPolicies: Policy[] = [
  {
    id: '1',
    insuranceId: '1',
    policyNumber: 'POL-12345',
    vehicle: 'PAJERO TD',
    registration: 'N795ENB',
    policyHolder: 'Mr M Bhatti',
    additionalDriver: 'None',
    coverStart: new Date('2024-11-18T21:00:26'),
    coverEnd: new Date('2024-11-19T21:00:26'),
    status: PolicyStatus.EXPIRED,
    documents: mockDocuments.filter(doc => doc.policyId === '1'),
  },
  {
    id: '2',
    insuranceId: '2',
    policyNumber: 'POL-67890',
    vehicle: 'FORD FOCUS',
    registration: 'AB12CDE',
    policyHolder: 'Ms J Smith',
    additionalDriver: 'Mr T Smith',
    coverStart: new Date('2024-10-05T14:30:15'),
    coverEnd: new Date(new Date().setDate(new Date().getDate() + 45)),
    status: PolicyStatus.ACTIVE,
    documents: mockDocuments.filter(doc => doc.policyId === '2'),
  },
  {
    id: '3',
    insuranceId: '3',
    policyNumber: 'POL-24680',
    vehicle: 'BMW 320D',
    registration: 'CD23EFG',
    policyHolder: 'Dr A Johnson',
    coverStart: new Date('2024-09-20T09:15:42'),
    coverEnd: new Date(new Date().setDate(new Date().getDate() + 10)),
    status: PolicyStatus.ACTIVE,
    documents: mockDocuments.filter(doc => doc.policyId === '3'),
  },
];

export const mockInsurances: Insurance[] = [
  {
    id: '1',
    userId: '1',
    type: 'Car',
    insurerName: 'Allianz',
    insurerClaimsLine: '0330 678 5659',
    policies: [mockPolicies[0]],
  },
  {
    id: '2',
    userId: '1',
    type: 'Home',
    insurerName: 'Aviva',
    insurerClaimsLine: '0800 012 345',
    policies: [mockPolicies[1]],
  },
  {
    id: '3',
    userId: '2',
    type: 'Car',
    insurerName: 'Direct Line',
    insurerClaimsLine: '0845 246 8000',
    policies: [mockPolicies[2]],
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mohammed Bhatti',
    email: 'mbhatti@example.com',
    phone: '07712345678',
    address: '123 High Street, London, E1 6BT',
    createdAt: new Date('2024-01-10'),
    createdBy: '1',
    status: UserStatus.ACTIVE,
    adminId: '1',
    insurances: [mockInsurances[0], mockInsurances[1]],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jsmith@example.com',
    phone: '07798765432',
    address: '45 Park Avenue, Manchester, M1 3WE',
    createdAt: new Date('2024-02-15'),
    createdBy: '1',
    status: UserStatus.ACTIVE,
    adminId: '1',
    insurances: [mockInsurances[2]],
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'ajohnson@example.com',
    phone: '07734567890',
    createdAt: new Date('2024-03-05'),
    createdBy: '2',
    status: UserStatus.PAUSED,
    adminId: '2',
    insurances: [],
  },
];