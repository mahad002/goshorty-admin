export enum UserRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PAUSED = "paused",
}

export enum PolicyStatus {
  ACTIVE = "Active",
  EXPIRED = "Expired",
  PENDING = "Pending",
  CANCELLED = "Cancelled",
}

export enum DocumentStatus {
  NEW = "New",
  DOWNLOADED = "Downloaded",
  VIEWED = "Viewed",
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  password?: string;
  createdBy: string;
  status: UserStatus;
  adminId?: string;
  insurances: Insurance[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  status: UserStatus;
  createdAt: Date;
  expiresAt?: Date;
  assignedUsers: string[];
}

export interface Insurance {
  id: string;
  userId: string;
  type: string;
  insurerName: string;
  insurerClaimsLine?: string;
  policies: Policy[];
}

export interface Policy {
  id: string;
  insuranceId: string;
  policyNumber?: string;
  vehicle?: string;
  registration?: string;
  policyHolder: string;
  additionalDriver?: string;
  coverStart: Date;
  coverEnd: Date;
  status: PolicyStatus;
  documents: Document[];
}

export interface Document {
  id: string;
  policyId: string;
  name: string;
  issued: Date;
  status: DocumentStatus;
  url?: string;
}

export interface EmailTemplate {
  service_id: string;
  template_id: string;
  user_id: string;
  template_params: {
    to_email: string;
    subject: string;
    user_name: string;
    policy_number?: string;
    policy_start_date?: string;
    policy_end_date?: string;
    documents_link?: string;
    insurance_provider?: string;
    client_reference?: string;
  };
}