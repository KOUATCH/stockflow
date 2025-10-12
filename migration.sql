-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('WAREHOUSE', 'STORE', 'DISTRIBUTION_CENTER', 'SUPPLIER', 'CUSTOMER', 'MANUFACTURING', 'QUARANTINE', 'DAMAGED', 'TRANSIT', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('QUANTITY', 'WEIGHT', 'VOLUME', 'LENGTH', 'AREA', 'TIME');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('SALES', 'VAT', 'GST', 'EXCISE', 'IMPORT', 'EXPORT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE_RECEIPT', 'SALES_RETURN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'PRODUCTION_IN', 'INITIAL_STOCK', 'SALE', 'PURCHASE_RETURN', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'PRODUCTION_OUT', 'DAMAGED', 'EXPIRED', 'THEFT', 'WRITE_OFF', 'SAMPLE', 'PROMOTION', 'RESERVATION', 'RESERVATION_RELEASE');

-- CreateEnum
CREATE TYPE "TransactionReferenceType" AS ENUM ('SALES_ORDER', 'PURCHASE_ORDER', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT', 'GOODS_RECEIPT', 'RETURN', 'MANUAL');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'DAMAGED', 'RETURNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GoodsReceiptStatus" AS ENUM ('DRAFT', 'RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('CYCLE_COUNT', 'PHYSICAL_COUNT', 'DAMAGED', 'EXPIRED', 'THEFT', 'WRITE_OFF', 'FOUND', 'CORRECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "POSSessionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "CashDrawerTransactionType" AS ENUM ('OPENING_BALANCE', 'SALE', 'RETURN', 'CASH_IN', 'CASH_OUT', 'CLOSING_BALANCE', 'RECONCILIATION', 'REFUND', 'PAYOUT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'DIGITAL', 'CARD');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ResourceVisibility" AS ENUM ('PRIVATE', 'ORGANIZATION', 'PUBLIC', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "PermissionSessionType" AS ENUM ('TEMPORARY_ELEVATION', 'EMERGENCY_ACCESS', 'DELEGATION', 'BREAK_GLASS', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('CLOCKED_IN', 'ON_BREAK', 'CLOCKED_OUT', 'OVERTIME', 'LATE', 'ABSENT', 'OFFLINE');

-- CreateEnum
CREATE TYPE "ClockMethod" AS ENUM ('MANUAL', 'BIOMETRIC', 'CARD_SWIPE', 'MOBILE_APP', 'WEB_BROWSER', 'QR_CODE', 'NFC', 'GEOFENCE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END', 'TASK_START', 'TASK_END', 'SYSTEM_LOGIN', 'SYSTEM_LOGOUT', 'POS_TRANSACTION', 'INVENTORY_UPDATE', 'CUSTOMER_SERVICE', 'CLEANING', 'RESTOCKING', 'TRAINING', 'MEETING', 'ADMIN_TASK', 'SYSTEM_IDLE', 'SYSTEM_ACTIVE', 'LOCATION_CHANGE', 'OTHER');

-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('LUNCH', 'SHORT_BREAK', 'PERSONAL', 'TRAINING', 'MEETING', 'EMERGENCY', 'SICK', 'REGULAR', 'EXTENDED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LATE_ARRIVAL', 'EARLY_DEPARTURE', 'MISSED_CLOCK_OUT', 'EXTENDED_BREAK', 'NO_SHOW', 'OVERTIME_ALERT', 'SCHEDULE_CONFLICT', 'UNUSUAL_ACTIVITY', 'LOCATION_MISMATCH', 'SYSTEM_ERROR');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "organizationId" TEXT,
    "permissionContext" JSONB,
    "riskAssessment" TEXT,
    "approvalChain" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "jobTitle" TEXT,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "parentId" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "hierarchyLevel" INTEGER NOT NULL DEFAULT 999,
    "maxUsers" INTEGER,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "locationRestrictions" TEXT[],
    "conditions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT,
    "country" TEXT,
    "state" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "inventoryStartDate" TIMESTAMP(3),
    "fiscalYearStart" TEXT DEFAULT '01-01',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isSystemPermission" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT,
    "visibility" "ResourceVisibility" NOT NULL DEFAULT 'PRIVATE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "conditions" JSONB,
    "grantedBy" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "resourceId" TEXT,
    "conditions" JSONB,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_permissions" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "roleId" TEXT,
    "permissionType" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "conditions" JSONB,

    CONSTRAINT "resource_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" "PermissionSessionType" NOT NULL,
    "permissions" TEXT[],
    "context" JSONB,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "reason" TEXT,

    CONSTRAINT "permission_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_approvals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedPermissions" TEXT[],
    "resourceId" TEXT,
    "justification" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedUntil" TIMESTAMP(3),
    "reviewNotes" TEXT,

    CONSTRAINT "permission_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "location" TEXT,
    "permissionsSnapshot" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'WAREHOUSE',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "managerId" TEXT,
    "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" "UnitType" NOT NULL DEFAULT 'QUANTITY',
    "baseUnit" TEXT,
    "conversionRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "taxRateName" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "type" "TaxType" NOT NULL DEFAULT 'SALES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "description" TEXT,
    "imageUrls" TEXT NOT NULL,
    "thumbnail" TEXT,
    "upc" TEXT,
    "ean" TEXT,
    "mpn" TEXT,
    "isbn" TEXT,
    "dimensions" TEXT,
    "weight" DOUBLE PRECISION,
    "color" TEXT,
    "size" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "msrp" DOUBLE PRECISION,
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "trackSerialNumbers" BOOLEAN NOT NULL DEFAULT false,
    "trackBatches" BOOLEAN NOT NULL DEFAULT false,
    "trackExpiry" BOOLEAN NOT NULL DEFAULT false,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "maxStockLevel" INTEGER,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "reorderQuantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDiscontinued" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT,
    "brandId" TEXT,
    "unitId" TEXT,
    "taxRateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_levels" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "quantityAvailable" INTEGER NOT NULL DEFAULT 0,
    "quantityInTransit" INTEGER NOT NULL DEFAULT 0,
    "quantityOnOrder" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "averageCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCountDate" TIMESTAMP(3),
    "lastTransactionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "referenceType" "TransactionReferenceType",
    "referenceId" TEXT,
    "referenceNumber" TEXT,
    "batchNumber" TEXT,
    "serialNumbers" TEXT[],
    "expiryDate" TIMESTAMP(3),
    "balanceAfter" INTEGER NOT NULL,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_numbers" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "SerialStatus" NOT NULL DEFAULT 'AVAILABLE',
    "itemId" TEXT NOT NULL,
    "locationId" TEXT,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "taxId" TEXT,
    "paymentTerms" INTEGER DEFAULT 30,
    "creditLimit" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_suppliers" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierSku" TEXT,
    "supplierName" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "leadTimeDays" INTEGER,
    "minOrderQuantity" INTEGER,
    "unitCost" DOUBLE PRECISION,
    "lastPurchaseDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "paymentTerms" INTEGER DEFAULT 30,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplierId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "orderedQuantity" INTEGER NOT NULL,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GoodsReceiptStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "purchaseOrderId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "receivedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_lines" (
    "id" TEXT NOT NULL,
    "goodsReceiptId" TEXT NOT NULL,
    "purchaseOrderLineId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "receivedQuantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "serialNumbers" TEXT[],
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "customerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "terminalId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_lines" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_sales_reports" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "totalRevenue" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "grossProfit" DECIMAL(10,2) NOT NULL,
    "grossMargin" DECIMAL(5,2) NOT NULL,
    "totalQuantitySold" INTEGER NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "averageTransactionValue" DECIMAL(10,2) NOT NULL,
    "itemsSold" INTEGER NOT NULL,
    "cashSales" DECIMAL(10,2) NOT NULL,
    "cardSales" DECIMAL(10,2) NOT NULL,
    "digitalSales" DECIMAL(10,2) NOT NULL,
    "openingBalance" DECIMAL(10,2) NOT NULL,
    "closingBalance" DECIMAL(10,2) NOT NULL,
    "cashIn" DECIMAL(10,2) NOT NULL,
    "cashOut" DECIMAL(10,2) NOT NULL,
    "variance" DECIMAL(10,2) NOT NULL,
    "reportGeneratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportGeneratedBy" TEXT,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "userId" TEXT,
    "itemId" TEXT,

    CONSTRAINT "daily_sales_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_sales_report_items" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemSku" TEXT NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "startingQuantity" INTEGER NOT NULL,
    "quantitySold" INTEGER NOT NULL,
    "endingQuantity" INTEGER NOT NULL,
    "cashSales" DECIMAL(10,2) NOT NULL,
    "cardSales" DECIMAL(10,2) NOT NULL,
    "digitalSales" DECIMAL(10,2) NOT NULL,
    "totalRevenue" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "grossProfit" DECIMAL(10,2) NOT NULL,
    "margin" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "daily_sales_report_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_sales_report_cash_events" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "transactionType" "CashDrawerTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "userName" TEXT,

    CONSTRAINT "daily_sales_report_cash_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "adjustmentNumber" TEXT NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'DRAFT',
    "adjustmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustment_lines" (
    "id" TEXT NOT NULL,
    "adjustmentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "systemQuantity" INTEGER NOT NULL,
    "actualQuantity" INTEGER NOT NULL,
    "adjustedQuantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "notes" TEXT,
    "serialNumbers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_adjustment_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "notes" TEXT,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_lines" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "shippedQuantity" INTEGER NOT NULL DEFAULT 0,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION,
    "notes" TEXT,
    "serialNumbers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transfer_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_terminals" (
    "id" TEXT NOT NULL,
    "terminalNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasCashDrawer" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "currentSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pOSSessionId" TEXT,

    CONSTRAINT "pos_terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_sessions" (
    "id" TEXT NOT NULL,
    "sessionNumber" TEXT NOT NULL,
    "status" "POSSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "terminalId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingBalance" DOUBLE PRECISION,
    "expectedBalance" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "cashTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cardTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "digitalTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_drawers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "drawerNumber" TEXT NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "locationId" TEXT NOT NULL,
    "terminalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_drawers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_drawer_transactions" (
    "id" TEXT NOT NULL,
    "type" "CashDrawerTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "cashDrawerId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_drawer_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "salesOrderId" TEXT,
    "purchaseOrderId" TEXT,
    "cardType" TEXT,
    "cardLast4" TEXT,
    "transactionId" TEXT,
    "authorizationCode" TEXT,
    "digitalWalletType" TEXT,
    "digitalTransactionId" TEXT,
    "cashTendered" DOUBLE PRECISION,
    "changeGiven" DOUBLE PRECISION,
    "processedAt" TIMESTAMP(3),
    "processorResponse" TEXT,
    "processedById" TEXT,
    "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_refunds" (
    "id" TEXT NOT NULL,
    "refundNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processorResponse" TEXT,
    "processedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_presence_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "terminalId" TEXT,
    "status" "PresenceStatus" NOT NULL DEFAULT 'CLOCKED_OUT',
    "clockInTime" TIMESTAMP(3) NOT NULL,
    "clockOutTime" TIMESTAMP(3),
    "expectedClockOutTime" TIMESTAMP(3),
    "totalMinutesWorked" INTEGER NOT NULL DEFAULT 0,
    "totalBreakMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtime" BOOLEAN NOT NULL DEFAULT false,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "clockInMethod" "ClockMethod" NOT NULL DEFAULT 'WEB_BROWSER',
    "clockOutMethod" "ClockMethod",
    "ipAddress" TEXT,
    "deviceInfo" JSONB,
    "geolocation" JSONB,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_presence_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_activity_logs" (
    "id" TEXT NOT NULL,
    "presenceSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "metadata" JSONB,
    "systemGenerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_break_sessions" (
    "id" TEXT NOT NULL,
    "presenceSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "breakType" "BreakType" NOT NULL DEFAULT 'REGULAR',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "expectedDuration" INTEGER,
    "actualDuration" INTEGER,
    "reason" TEXT,
    "notes" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_break_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),
    "breakDurations" INTEGER[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presence_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presence_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "scheduledMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER NOT NULL,
    "breakMinutes" INTEGER NOT NULL,
    "overtimeMinutes" INTEGER NOT NULL,
    "lateArrivalMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyDepartureMinutes" INTEGER NOT NULL DEFAULT 0,
    "attendanceScore" DOUBLE PRECISION NOT NULL,
    "productivity" DOUBLE PRECISION,
    "notes" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_riskAssessment_idx" ON "audit_logs"("riskAssessment");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_lastLoginAt_idx" ON "users"("lastLoginAt");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "roles_code_idx" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_parentId_idx" ON "roles"("parentId");

-- CreateIndex
CREATE INDEX "roles_organizationId_hierarchyLevel_idx" ON "roles"("organizationId", "hierarchyLevel");

-- CreateIndex
CREATE UNIQUE INDEX "roles_organizationId_code_key" ON "roles"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_category_idx" ON "permissions"("category");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");

-- CreateIndex
CREATE INDEX "permissions_riskLevel_idx" ON "permissions"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "resources_organizationId_resourceType_idx" ON "resources"("organizationId", "resourceType");

-- CreateIndex
CREATE INDEX "resources_ownerId_idx" ON "resources"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "resources_resourceType_resourceId_organizationId_key" ON "resources"("resourceType", "resourceId", "organizationId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "role_permissions_expiresAt_idx" ON "role_permissions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "user_permissions_userId_idx" ON "user_permissions"("userId");

-- CreateIndex
CREATE INDEX "user_permissions_permissionId_idx" ON "user_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "user_permissions_resourceId_idx" ON "user_permissions"("resourceId");

-- CreateIndex
CREATE INDEX "user_permissions_expiresAt_idx" ON "user_permissions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_permissionId_resourceId_key" ON "user_permissions"("userId", "permissionId", "resourceId");

-- CreateIndex
CREATE INDEX "resource_permissions_resourceId_idx" ON "resource_permissions"("resourceId");

-- CreateIndex
CREATE INDEX "resource_permissions_userId_idx" ON "resource_permissions"("userId");

-- CreateIndex
CREATE INDEX "resource_permissions_roleId_idx" ON "resource_permissions"("roleId");

-- CreateIndex
CREATE INDEX "resource_permissions_expiresAt_idx" ON "resource_permissions"("expiresAt");

-- CreateIndex
CREATE INDEX "permission_sessions_userId_idx" ON "permission_sessions"("userId");

-- CreateIndex
CREATE INDEX "permission_sessions_expiresAt_idx" ON "permission_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "permission_sessions_sessionType_idx" ON "permission_sessions"("sessionType");

-- CreateIndex
CREATE INDEX "permission_approvals_userId_idx" ON "permission_approvals"("userId");

-- CreateIndex
CREATE INDEX "permission_approvals_status_idx" ON "permission_approvals"("status");

-- CreateIndex
CREATE INDEX "permission_approvals_requestedAt_idx" ON "permission_approvals"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "user_sessions_lastActivity_idx" ON "user_sessions"("lastActivity");

-- CreateIndex
CREATE INDEX "invites_email_idx" ON "invites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invites_email_organizationId_key" ON "invites"("email", "organizationId");

-- CreateIndex
CREATE INDEX "locations_organizationId_idx" ON "locations"("organizationId");

-- CreateIndex
CREATE INDEX "locations_type_idx" ON "locations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "locations_organizationId_code_key" ON "locations"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_organizationId_idx" ON "categories"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_organizationId_slug_key" ON "categories"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_organizationId_idx" ON "brands"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "brands_organizationId_slug_key" ON "brands"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "units_organizationId_idx" ON "units"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "units_organizationId_name_key" ON "units"("organizationId", "name");

-- CreateIndex
CREATE INDEX "tax_rates_organizationId_idx" ON "tax_rates"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_organizationId_taxRateName_key" ON "tax_rates"("organizationId", "taxRateName");

-- CreateIndex
CREATE UNIQUE INDEX "items_slug_key" ON "items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "items_sku_key" ON "items"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "items_barcode_key" ON "items"("barcode");

-- CreateIndex
CREATE INDEX "items_organizationId_idx" ON "items"("organizationId");

-- CreateIndex
CREATE INDEX "items_categoryId_idx" ON "items"("categoryId");

-- CreateIndex
CREATE INDEX "items_brandId_idx" ON "items"("brandId");

-- CreateIndex
CREATE INDEX "items_barcode_idx" ON "items"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "items_organizationId_sku_key" ON "items"("organizationId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "items_organizationId_name_key" ON "items"("organizationId", "name");

-- CreateIndex
CREATE INDEX "inventory_levels_itemId_idx" ON "inventory_levels"("itemId");

-- CreateIndex
CREATE INDEX "inventory_levels_locationId_idx" ON "inventory_levels"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_levels_itemId_locationId_key" ON "inventory_levels"("itemId", "locationId");

-- CreateIndex
CREATE INDEX "inventory_transactions_itemId_idx" ON "inventory_transactions"("itemId");

-- CreateIndex
CREATE INDEX "inventory_transactions_locationId_idx" ON "inventory_transactions"("locationId");

-- CreateIndex
CREATE INDEX "inventory_transactions_organizationId_idx" ON "inventory_transactions"("organizationId");

-- CreateIndex
CREATE INDEX "inventory_transactions_type_idx" ON "inventory_transactions"("type");

-- CreateIndex
CREATE INDEX "inventory_transactions_createdAt_idx" ON "inventory_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "inventory_transactions_referenceType_referenceId_idx" ON "inventory_transactions"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "serial_numbers_serialNumber_key" ON "serial_numbers"("serialNumber");

-- CreateIndex
CREATE INDEX "serial_numbers_itemId_idx" ON "serial_numbers"("itemId");

-- CreateIndex
CREATE INDEX "serial_numbers_status_idx" ON "serial_numbers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_organizationId_idx" ON "suppliers"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_organizationId_code_key" ON "suppliers"("organizationId", "code");

-- CreateIndex
CREATE INDEX "item_suppliers_supplierId_idx" ON "item_suppliers"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "item_suppliers_itemId_supplierId_key" ON "item_suppliers"("itemId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- CreateIndex
CREATE INDEX "customers_organizationId_idx" ON "customers"("organizationId");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organizationId_code_key" ON "customers"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_orders_locationId_idx" ON "purchase_orders"("locationId");

-- CreateIndex
CREATE INDEX "purchase_orders_organizationId_idx" ON "purchase_orders"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_orders_orderDate_idx" ON "purchase_orders"("orderDate");

-- CreateIndex
CREATE INDEX "purchase_order_lines_purchaseOrderId_idx" ON "purchase_order_lines"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_lines_itemId_idx" ON "purchase_order_lines"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_receiptNumber_key" ON "goods_receipts"("receiptNumber");

-- CreateIndex
CREATE INDEX "goods_receipts_purchaseOrderId_idx" ON "goods_receipts"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "goods_receipts_locationId_idx" ON "goods_receipts"("locationId");

-- CreateIndex
CREATE INDEX "goods_receipts_status_idx" ON "goods_receipts"("status");

-- CreateIndex
CREATE INDEX "goods_receipt_lines_goodsReceiptId_idx" ON "goods_receipt_lines"("goodsReceiptId");

-- CreateIndex
CREATE INDEX "goods_receipt_lines_purchaseOrderLineId_idx" ON "goods_receipt_lines"("purchaseOrderLineId");

-- CreateIndex
CREATE INDEX "goods_receipt_lines_itemId_idx" ON "goods_receipt_lines"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_orderNumber_key" ON "sales_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "sales_orders_customerId_idx" ON "sales_orders"("customerId");

-- CreateIndex
CREATE INDEX "sales_orders_locationId_idx" ON "sales_orders"("locationId");

-- CreateIndex
CREATE INDEX "sales_orders_organizationId_idx" ON "sales_orders"("organizationId");

-- CreateIndex
CREATE INDEX "sales_orders_status_idx" ON "sales_orders"("status");

-- CreateIndex
CREATE INDEX "sales_orders_paymentStatus_idx" ON "sales_orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "sales_orders_orderDate_idx" ON "sales_orders"("orderDate");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_orderNumber_organizationId_locationId_key" ON "sales_orders"("orderNumber", "organizationId", "locationId");

-- CreateIndex
CREATE INDEX "sales_order_lines_salesOrderId_idx" ON "sales_order_lines"("salesOrderId");

-- CreateIndex
CREATE INDEX "sales_order_lines_itemId_idx" ON "sales_order_lines"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sales_reports_date_locationId_organizationId_key" ON "daily_sales_reports"("date", "locationId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_adjustments_adjustmentNumber_key" ON "stock_adjustments"("adjustmentNumber");

-- CreateIndex
CREATE INDEX "stock_adjustments_locationId_idx" ON "stock_adjustments"("locationId");

-- CreateIndex
CREATE INDEX "stock_adjustments_organizationId_idx" ON "stock_adjustments"("organizationId");

-- CreateIndex
CREATE INDEX "stock_adjustments_status_idx" ON "stock_adjustments"("status");

-- CreateIndex
CREATE INDEX "stock_adjustments_type_idx" ON "stock_adjustments"("type");

-- CreateIndex
CREATE INDEX "stock_adjustment_lines_adjustmentId_idx" ON "stock_adjustment_lines"("adjustmentId");

-- CreateIndex
CREATE INDEX "stock_adjustment_lines_itemId_idx" ON "stock_adjustment_lines"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_transferNumber_key" ON "stock_transfers"("transferNumber");

-- CreateIndex
CREATE INDEX "stock_transfers_fromLocationId_idx" ON "stock_transfers"("fromLocationId");

-- CreateIndex
CREATE INDEX "stock_transfers_toLocationId_idx" ON "stock_transfers"("toLocationId");

-- CreateIndex
CREATE INDEX "stock_transfers_organizationId_idx" ON "stock_transfers"("organizationId");

-- CreateIndex
CREATE INDEX "stock_transfers_status_idx" ON "stock_transfers"("status");

-- CreateIndex
CREATE INDEX "stock_transfer_lines_transferId_idx" ON "stock_transfer_lines"("transferId");

-- CreateIndex
CREATE INDEX "stock_transfer_lines_itemId_idx" ON "stock_transfer_lines"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "pos_terminals_terminalNumber_key" ON "pos_terminals"("terminalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pos_terminals_currentSessionId_key" ON "pos_terminals"("currentSessionId");

-- CreateIndex
CREATE INDEX "pos_terminals_locationId_idx" ON "pos_terminals"("locationId");

-- CreateIndex
CREATE INDEX "pos_terminals_organizationId_idx" ON "pos_terminals"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "pos_sessions_sessionNumber_key" ON "pos_sessions"("sessionNumber");

-- CreateIndex
CREATE INDEX "pos_sessions_terminalId_idx" ON "pos_sessions"("terminalId");

-- CreateIndex
CREATE INDEX "pos_sessions_userId_idx" ON "pos_sessions"("userId");

-- CreateIndex
CREATE INDEX "pos_sessions_status_idx" ON "pos_sessions"("status");

-- CreateIndex
CREATE INDEX "cash_drawers_locationId_idx" ON "cash_drawers"("locationId");

-- CreateIndex
CREATE INDEX "cash_drawer_transactions_cashDrawerId_idx" ON "cash_drawer_transactions"("cashDrawerId");

-- CreateIndex
CREATE INDEX "cash_drawer_transactions_sessionId_idx" ON "cash_drawer_transactions"("sessionId");

-- CreateIndex
CREATE INDEX "cash_drawer_transactions_type_idx" ON "cash_drawer_transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "payments_salesOrderId_idx" ON "payments"("salesOrderId");

-- CreateIndex
CREATE INDEX "payments_purchaseOrderId_idx" ON "payments"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_refunds_refundNumber_key" ON "payment_refunds"("refundNumber");

-- CreateIndex
CREATE INDEX "payment_refunds_paymentId_idx" ON "payment_refunds"("paymentId");

-- CreateIndex
CREATE INDEX "payment_refunds_status_idx" ON "payment_refunds"("status");

-- CreateIndex
CREATE INDEX "employee_presence_sessions_userId_idx" ON "employee_presence_sessions"("userId");

-- CreateIndex
CREATE INDEX "employee_presence_sessions_locationId_idx" ON "employee_presence_sessions"("locationId");

-- CreateIndex
CREATE INDEX "employee_presence_sessions_organizationId_idx" ON "employee_presence_sessions"("organizationId");

-- CreateIndex
CREATE INDEX "employee_presence_sessions_status_idx" ON "employee_presence_sessions"("status");

-- CreateIndex
CREATE INDEX "employee_presence_sessions_clockInTime_idx" ON "employee_presence_sessions"("clockInTime");

-- CreateIndex
CREATE INDEX "employee_activity_logs_presenceSessionId_idx" ON "employee_activity_logs"("presenceSessionId");

-- CreateIndex
CREATE INDEX "employee_activity_logs_userId_idx" ON "employee_activity_logs"("userId");

-- CreateIndex
CREATE INDEX "employee_activity_logs_activityType_idx" ON "employee_activity_logs"("activityType");

-- CreateIndex
CREATE INDEX "employee_activity_logs_timestamp_idx" ON "employee_activity_logs"("timestamp");

-- CreateIndex
CREATE INDEX "employee_break_sessions_presenceSessionId_idx" ON "employee_break_sessions"("presenceSessionId");

-- CreateIndex
CREATE INDEX "employee_break_sessions_userId_idx" ON "employee_break_sessions"("userId");

-- CreateIndex
CREATE INDEX "employee_break_sessions_startTime_idx" ON "employee_break_sessions"("startTime");

-- CreateIndex
CREATE INDEX "employee_schedules_userId_idx" ON "employee_schedules"("userId");

-- CreateIndex
CREATE INDEX "employee_schedules_organizationId_idx" ON "employee_schedules"("organizationId");

-- CreateIndex
CREATE INDEX "employee_schedules_dayOfWeek_idx" ON "employee_schedules"("dayOfWeek");

-- CreateIndex
CREATE INDEX "employee_schedules_effectiveFrom_idx" ON "employee_schedules"("effectiveFrom");

-- CreateIndex
CREATE INDEX "presence_alerts_userId_idx" ON "presence_alerts"("userId");

-- CreateIndex
CREATE INDEX "presence_alerts_organizationId_idx" ON "presence_alerts"("organizationId");

-- CreateIndex
CREATE INDEX "presence_alerts_alertType_idx" ON "presence_alerts"("alertType");

-- CreateIndex
CREATE INDEX "presence_alerts_severity_idx" ON "presence_alerts"("severity");

-- CreateIndex
CREATE INDEX "presence_alerts_isRead_idx" ON "presence_alerts"("isRead");

-- CreateIndex
CREATE INDEX "presence_alerts_isResolved_idx" ON "presence_alerts"("isResolved");

-- CreateIndex
CREATE INDEX "attendance_reports_userId_idx" ON "attendance_reports"("userId");

-- CreateIndex
CREATE INDEX "attendance_reports_organizationId_idx" ON "attendance_reports"("organizationId");

-- CreateIndex
CREATE INDEX "attendance_reports_reportDate_idx" ON "attendance_reports"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_reports_userId_reportDate_key" ON "attendance_reports"("userId", "reportDate");

-- CreateIndex
CREATE INDEX "_UserRoles_B_index" ON "_UserRoles"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_sessions" ADD CONSTRAINT "permission_sessions_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_sessions" ADD CONSTRAINT "permission_sessions_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_sessions" ADD CONSTRAINT "permission_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_approvals" ADD CONSTRAINT "permission_approvals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "tax_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_suppliers" ADD CONSTRAINT "item_suppliers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_suppliers" ADD CONSTRAINT "item_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "purchase_order_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pos_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "pos_terminals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_reports" ADD CONSTRAINT "daily_sales_reports_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_reports" ADD CONSTRAINT "daily_sales_reports_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_reports" ADD CONSTRAINT "daily_sales_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_reports" ADD CONSTRAINT "daily_sales_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_report_items" ADD CONSTRAINT "daily_sales_report_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_report_items" ADD CONSTRAINT "daily_sales_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "daily_sales_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales_report_cash_events" ADD CONSTRAINT "daily_sales_report_cash_events_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "daily_sales_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_lines" ADD CONSTRAINT "stock_adjustment_lines_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "stock_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_lines" ADD CONSTRAINT "stock_adjustment_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_lines" ADD CONSTRAINT "stock_transfer_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_lines" ADD CONSTRAINT "stock_transfer_lines_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_currentSessionId_fkey" FOREIGN KEY ("currentSessionId") REFERENCES "pos_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_pOSSessionId_fkey" FOREIGN KEY ("pOSSessionId") REFERENCES "pos_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "pos_terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "pos_terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawer_transactions" ADD CONSTRAINT "cash_drawer_transactions_cashDrawerId_fkey" FOREIGN KEY ("cashDrawerId") REFERENCES "cash_drawers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawer_transactions" ADD CONSTRAINT "cash_drawer_transactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pos_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_drawer_transactions" ADD CONSTRAINT "cash_drawer_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_presence_sessions" ADD CONSTRAINT "employee_presence_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_presence_sessions" ADD CONSTRAINT "employee_presence_sessions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_presence_sessions" ADD CONSTRAINT "employee_presence_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_presence_sessions" ADD CONSTRAINT "employee_presence_sessions_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_activity_logs" ADD CONSTRAINT "employee_activity_logs_presenceSessionId_fkey" FOREIGN KEY ("presenceSessionId") REFERENCES "employee_presence_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_activity_logs" ADD CONSTRAINT "employee_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_break_sessions" ADD CONSTRAINT "employee_break_sessions_presenceSessionId_fkey" FOREIGN KEY ("presenceSessionId") REFERENCES "employee_presence_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_break_sessions" ADD CONSTRAINT "employee_break_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_break_sessions" ADD CONSTRAINT "employee_break_sessions_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_schedules" ADD CONSTRAINT "employee_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_schedules" ADD CONSTRAINT "employee_schedules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_schedules" ADD CONSTRAINT "employee_schedules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_alerts" ADD CONSTRAINT "presence_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_alerts" ADD CONSTRAINT "presence_alerts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_alerts" ADD CONSTRAINT "presence_alerts_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

