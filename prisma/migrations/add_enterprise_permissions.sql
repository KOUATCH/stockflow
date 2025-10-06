-- Enterprise Permissions System Migration
-- This migration adds comprehensive RBAC support with resource-level permissions

-- Add new columns to existing Role model
ALTER TABLE "roles"
ADD COLUMN "parent_id" TEXT,
ADD COLUMN "is_system_role" BOOLEAN DEFAULT FALSE,
ADD COLUMN "hierarchy_level" INTEGER DEFAULT 999,
ADD COLUMN "max_users" INTEGER,
ADD COLUMN "valid_from" TIMESTAMP,
ADD COLUMN "valid_until" TIMESTAMP,
ADD COLUMN "location_restrictions" TEXT[],
ADD COLUMN "conditions" JSONB,
ADD COLUMN "is_active" BOOLEAN DEFAULT TRUE;

-- Create Permission model for granular permissions
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "is_system_permission" BOOLEAN DEFAULT FALSE,
    "requires_approval" BOOLEAN DEFAULT FALSE,
    "risk_level" TEXT DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- Create Resource model for resource-level access control
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "owner_id" TEXT,
    "visibility" TEXT DEFAULT 'PRIVATE',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- Create RolePermission junction table with conditions
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "conditions" JSONB,
    "granted_by" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN DEFAULT TRUE,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Create UserPermission model for direct user permissions
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "resource_id" TEXT,
    "conditions" JSONB,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "reason" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- Create ResourcePermission model for resource-specific access
CREATE TABLE "resource_permissions" (
    "id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "user_id" TEXT,
    "role_id" TEXT,
    "permission_type" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "conditions" JSONB,

    CONSTRAINT "resource_permissions_pkey" PRIMARY KEY ("id")
);

-- Create PermissionSession model for temporary permissions
CREATE TABLE "permission_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_type" TEXT NOT NULL,
    "permissions" TEXT[],
    "context" JSONB,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,
    "reason" TEXT,

    CONSTRAINT "permission_sessions_pkey" PRIMARY KEY ("id")
);

-- Create PermissionApproval model for approval workflows
CREATE TABLE "permission_approvals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "requested_permissions" TEXT[],
    "resource_id" TEXT,
    "justification" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING',
    "requested_by" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "approved_until" TIMESTAMP(3),
    "review_notes" TEXT,

    CONSTRAINT "permission_approvals_pkey" PRIMARY KEY ("id")
);

-- Create SessionManagement model for active user sessions
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL UNIQUE,
    "device_info" JSONB,
    "ip_address" TEXT,
    "location" TEXT,
    "permissions_snapshot" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "resources" ADD CONSTRAINT "resources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resources" ADD CONSTRAINT "resources_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "permission_sessions" ADD CONSTRAINT "permission_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "permission_sessions" ADD CONSTRAINT "permission_sessions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "permission_sessions" ADD CONSTRAINT "permission_sessions_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create unique constraints
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");
CREATE UNIQUE INDEX "resources_type_id_org_key" ON "resources"("resource_type", "resource_id", "organization_id");
CREATE UNIQUE INDEX "role_permissions_role_permission_key" ON "role_permissions"("role_id", "permission_id");
CREATE UNIQUE INDEX "user_permissions_user_permission_resource_key" ON "user_permissions"("user_id", "permission_id", "resource_id");

-- Create indexes for performance
CREATE INDEX "roles_parent_id_idx" ON "roles"("parent_id");
CREATE INDEX "roles_organization_id_hierarchy_idx" ON "roles"("organization_id", "hierarchy_level");
CREATE INDEX "permissions_category_idx" ON "permissions"("category");
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");
CREATE INDEX "resources_organization_type_idx" ON "resources"("organization_id", "resource_type");
CREATE INDEX "resources_owner_idx" ON "resources"("owner_id");
CREATE INDEX "role_permissions_role_idx" ON "role_permissions"("role_id");
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions"("permission_id");
CREATE INDEX "user_permissions_user_idx" ON "user_permissions"("user_id");
CREATE INDEX "user_permissions_permission_idx" ON "user_permissions"("permission_id");
CREATE INDEX "user_permissions_resource_idx" ON "user_permissions"("resource_id");
CREATE INDEX "resource_permissions_resource_idx" ON "resource_permissions"("resource_id");
CREATE INDEX "resource_permissions_user_idx" ON "resource_permissions"("user_id");
CREATE INDEX "resource_permissions_role_idx" ON "resource_permissions"("role_id");
CREATE INDEX "permission_sessions_user_idx" ON "permission_sessions"("user_id");
CREATE INDEX "permission_sessions_expires_idx" ON "permission_sessions"("expires_at");
CREATE INDEX "permission_approvals_user_idx" ON "permission_approvals"("user_id");
CREATE INDEX "permission_approvals_status_idx" ON "permission_approvals"("status");
CREATE INDEX "user_sessions_user_idx" ON "user_sessions"("user_id");
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("session_token");
CREATE INDEX "user_sessions_expires_idx" ON "user_sessions"("expires_at");

-- Add audit log enhancements
ALTER TABLE "audit_logs"
ADD COLUMN "permission_context" JSONB,
ADD COLUMN "risk_assessment" TEXT,
ADD COLUMN "approval_chain" TEXT[];

-- Update existing audit log indexes
CREATE INDEX "audit_logs_permission_context_idx" ON "audit_logs" USING gin("permission_context");
CREATE INDEX "audit_logs_risk_assessment_idx" ON "audit_logs"("risk_assessment");