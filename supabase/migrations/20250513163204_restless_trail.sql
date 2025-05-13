/*
  # Initial Schema Setup

  1. New Tables
    - `admins`
      - Stores admin users with role-based access control
      - Includes expiration date for temporary admins
    - `users`
      - Stores end users managed by admins
    - `insurances`
      - Links users to their insurance providers
    - `policies`
      - Stores policy details linked to insurances
    - `documents`
      - Stores document metadata linked to policies
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'paused');
CREATE TYPE policy_status AS ENUM ('active', 'expired', 'pending', 'cancelled');
CREATE TYPE document_status AS ENUM ('new', 'downloaded', 'viewed');

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'admin',
  status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  
  CONSTRAINT valid_expiry CHECK (
    (role = 'super_admin' AND expires_at IS NULL) OR
    (role = 'admin')
  )
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES admins(id),
  status user_status NOT NULL DEFAULT 'active',
  admin_id uuid REFERENCES admins(id)
);

-- Create insurances table
CREATE TABLE IF NOT EXISTS insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  insurer_name text NOT NULL,
  insurer_claims_line text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  policy_number text,
  vehicle text,
  registration text,
  policy_holder text NOT NULL,
  additional_driver text,
  cover_start timestamptz NOT NULL,
  cover_end timestamptz NOT NULL,
  status policy_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (cover_end > cover_start)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  name text NOT NULL,
  issued timestamptz NOT NULL DEFAULT now(),
  status document_status NOT NULL DEFAULT 'new',
  -- storage_path text NOT NULL, -- Commented out until S3/Storage setup
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins table policies
CREATE POLICY "Super admins can do everything with admins"
  ON admins
  TO authenticated
  USING (auth.jwt()->>'role' = 'super_admin')
  WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Admins can read own profile"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users table policies
CREATE POLICY "Super admins can do everything with users"
  ON users
  TO authenticated
  USING (auth.jwt()->>'role' = 'super_admin')
  WITH CHECK (auth.jwt()->>'role' = 'super_admin');

CREATE POLICY "Admins can manage assigned users"
  ON users
  TO authenticated
  USING (
    admin_id = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    admin_id = auth.uid() OR
    created_by = auth.uid()
  );

-- Insurance policies
CREATE POLICY "Users can be managed by their admins"
  ON insurances
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurances.user_id
      AND (users.admin_id = auth.uid() OR users.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = insurances.user_id
      AND (users.admin_id = auth.uid() OR users.created_by = auth.uid())
    )
  );

-- Policies table policies
CREATE POLICY "Policies can be managed by user's admin"
  ON policies
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM insurances
      JOIN users ON users.id = insurances.user_id
      WHERE insurances.id = policies.insurance_id
      AND (users.admin_id = auth.uid() OR users.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM insurances
      JOIN users ON users.id = insurances.user_id
      WHERE insurances.id = policies.insurance_id
      AND (users.admin_id = auth.uid() OR users.created_by = auth.uid())
    )
  );

-- Documents table policies
CREATE POLICY "Documents can be managed by policy's admin"
  ON documents
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM policies
      JOIN insurances ON insurances.id = policies.insurance_id
      JOIN users ON users.id = insurances.user_id
      WHERE policies.id = documents.policy_id
      AND (users.admin_id = auth.uid() OR users.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM policies
      JOIN insurances ON insurances.id = policies.insurance_id
      JOIN users ON users.id = insurances.user_id
      WHERE policies.id = documents.policy_id
      AND (users.admin_id = auth.uid() OR users.created_by = auth.uid())
    )
  );