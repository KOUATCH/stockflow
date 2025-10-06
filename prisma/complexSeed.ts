import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Seed configuration
const SEED_CONFIG = {
  organizations: 5,
  usersPerOrg: 20,
  rolesPerOrg: 8,
  categoriesPerOrg: 15,
  brandsPerOrg: 12,
  unitsPerOrg: 10,
  locationsPerOrg: 8,
  suppliersPerOrg: 15,
  itemsPerOrg: 100,
  customersPerOrg: 50,
  taxRatesPerOrg: 8,
  inventoryMovementsPerOrg: 200,
  salesPerOrg: 150,
  purchaseOrdersPerOrg: 50,
  permissionSessionsPerOrg: 30,
  permissionApprovalsPerOrg: 40,
  auditLogsPerOrg: 500,
};

// Enterprise permission definitions
const SYSTEM_PERMISSIONS = [
  // Platform Administration
  'PLATFORM_ADMIN', 'SYSTEM_MAINTENANCE', 'GLOBAL_SETTINGS', 'ORGANIZATION_MANAGEMENT',

  // User Management
  'CREATE_USERS', 'READ_USERS', 'UPDATE_USERS', 'DELETE_USERS', 'MANAGE_USER_ROLES',
  'INVITE_USERS', 'SUSPEND_USERS', 'RESET_PASSWORDS', 'VIEW_USER_SESSIONS',

  // Role & Permission Management
  'CREATE_ROLES', 'READ_ROLES', 'UPDATE_ROLES', 'DELETE_ROLES', 'ASSIGN_ROLES',
  'GRANT_PERMISSIONS', 'REVOKE_PERMISSIONS', 'VIEW_PERMISSIONS', 'MANAGE_PERMISSIONS',

  // Inventory Management
  'CREATE_ITEMS', 'READ_ITEMS', 'UPDATE_ITEMS', 'DELETE_ITEMS', 'MANAGE_INVENTORY_LEVELS',
  'ADJUST_STOCK', 'TRANSFER_STOCK', 'VIEW_INVENTORY_REPORTS', 'MANAGE_CATEGORIES',
  'MANAGE_BRANDS', 'MANAGE_UNITS', 'MANAGE_SUPPLIERS',

  // Sales & POS
  'OPERATE_POS', 'PROCESS_SALES', 'HANDLE_RETURNS', 'MANAGE_CUSTOMERS',
  'VIEW_SALES_REPORTS', 'ACCESS_CASH_DRAWER', 'MANAGE_POS_SESSIONS',

  // Financial Management
  'VIEW_FINANCIAL_REPORTS', 'MANAGE_PRICING', 'MANAGE_TAX_RATES', 'VIEW_PROFIT_LOSS',
  'MANAGE_CASH_FLOW', 'EXPORT_FINANCIAL_DATA',

  // Audit & Security
  'VIEW_AUDIT_LOGS', 'MANAGE_SECURITY_SETTINGS', 'VIEW_SECURITY_ALERTS',
  'EMERGENCY_ACCESS', 'APPROVE_HIGH_RISK_ACTIONS',

  // Resource Management
  'CREATE_RESOURCES', 'MANAGE_RESOURCES', 'DELETE_RESOURCES', 'MANAGE_RESOURCE_PERMISSIONS',
];

// Role hierarchy definitions
const ROLE_HIERARCHY = [
  { code: 'platform_admin', name: 'Platform Administrator', level: 1, isSystemRole: true },
  { code: 'organization_owner', name: 'Organization Owner', level: 2, isSystemRole: true },
  { code: 'administrator', name: 'Administrator', level: 3, isSystemRole: false },
  { code: 'manager', name: 'Manager', level: 4, isSystemRole: false },
  { code: 'supervisor', name: 'Supervisor', level: 5, isSystemRole: false },
  { code: 'cashier', name: 'Cashier', level: 6, isSystemRole: false },
  { code: 'inventory_clerk', name: 'Inventory Clerk', level: 6, isSystemRole: false },
  { code: 'sales_associate', name: 'Sales Associate', level: 7, isSystemRole: false },
];

// Permission categories for risk assessment
const PERMISSION_CATEGORIES = [
  'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'INVENTORY_MANAGEMENT', 'SALES_OPERATIONS',
  'FINANCIAL_MANAGEMENT', 'AUDIT_SECURITY', 'RESOURCE_MANAGEMENT', 'SYSTEM_ADMINISTRATION'
];

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
const VISIBILITY_LEVELS = ['PRIVATE', 'ORGANIZATION', 'PUBLIC'];

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Data generation functions
async function createOrganizations() {
  console.log('Creating organizations...');
  const organizations = [];

  for (let i = 0; i < SEED_CONFIG.organizations; i++) {
    const org = await prisma.organization.create({
      data: {
        name: faker.company.name(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        country: faker.location.country(),
        taxPin: faker.string.alphanumeric(10).toUpperCase(),
        imageUrl: faker.image.avatar(),
        isActive: true,
      },
    });
    organizations.push(org);
  }

  return organizations;
}

async function createPermissions() {
  console.log('Creating system permissions...');
  const permissions = [];

  for (const permissionCode of SYSTEM_PERMISSIONS) {
    const category = getRandomElement(PERMISSION_CATEGORIES);
    const riskLevel = getRandomElement(RISK_LEVELS);

    const permission = await prisma.permission.create({
      data: {
        code: permissionCode,
        name: permissionCode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        description: faker.lorem.sentence(),
        category,
        riskLevel,
        requiresApproval: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
        approvalChain: riskLevel === 'CRITICAL' ? ['administrator', 'organization_owner'] :
                      riskLevel === 'HIGH' ? ['administrator'] : [],
        timeRestrictions: riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? {
          allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
          allowedHours: { start: 9, end: 18 }, // 9 AM to 6 PM
        } : null,
        amountLimits: category === 'FINANCIAL_MANAGEMENT' ? {
          maxAmount: riskLevel === 'CRITICAL' ? 100000 : riskLevel === 'HIGH' ? 50000 : 10000,
          currency: 'USD',
        } : null,
        businessRules: {
          requiresTwoPersonApproval: riskLevel === 'CRITICAL',
          auditLevel: riskLevel,
          sessionTimeout: riskLevel === 'CRITICAL' ? 1800 : 3600, // 30 min or 1 hour
        },
        isActive: true,
      },
    });
    permissions.push(permission);
  }

  return permissions;
}

async function createRoles(organizationId: string) {
  console.log(`Creating roles for organization ${organizationId}...`);
  const roles = [];

  for (const roleConfig of ROLE_HIERARCHY) {
    const role = await prisma.role.create({
      data: {
        code: roleConfig.code,
        name: roleConfig.name,
        description: faker.lorem.sentence(),
        hierarchyLevel: roleConfig.level,
        isActive: true,
        isSystemRole: roleConfig.isSystemRole,
        organizationId,
      },
    });
    roles.push(role);
  }

  return roles;
}

async function assignPermissionsToRoles(roles: any[], permissions: any[]) {
  console.log('Assigning permissions to roles...');

  for (const role of roles) {
    let permissionCount: number;

    // Assign permissions based on role hierarchy
    switch (role.hierarchyLevel) {
      case 1: // Platform Admin
        permissionCount = permissions.length; // All permissions
        break;
      case 2: // Organization Owner
        permissionCount = Math.floor(permissions.length * 0.9); // 90% of permissions
        break;
      case 3: // Administrator
        permissionCount = Math.floor(permissions.length * 0.7); // 70% of permissions
        break;
      case 4: // Manager
        permissionCount = Math.floor(permissions.length * 0.5); // 50% of permissions
        break;
      case 5: // Supervisor
        permissionCount = Math.floor(permissions.length * 0.3); // 30% of permissions
        break;
      case 6: // Cashier/Inventory Clerk
        permissionCount = Math.floor(permissions.length * 0.2); // 20% of permissions
        break;
      case 7: // Sales Associate
        permissionCount = Math.floor(permissions.length * 0.1); // 10% of permissions
        break;
      default:
        permissionCount = 5;
    }

    const rolePermissions = role.hierarchyLevel === 1 ?
      permissions : // Platform admin gets all permissions
      getRandomElements(permissions, permissionCount);

    for (const permission of rolePermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
          conditions: faker.datatype.boolean() ? {
            ipRestriction: faker.internet.ip(),
            timeWindow: { start: 9, end: 17 },
            requireSecondaryAuth: permission.riskLevel === 'CRITICAL',
          } : null,
          isActive: true,
          grantedAt: faker.date.past(),
          expiresAt: faker.datatype.boolean() ? faker.date.future() : null,
        },
      });
    }
  }
}

async function createUsers(organizationId: string, roles: any[]) {
  console.log(`Creating users for organization ${organizationId}...`);
  const users = [];
  const hashedPassword = await hashPassword('password123');

  for (let i = 0; i < SEED_CONFIG.usersPerOrg; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone: faker.phone.number(),
        password: hashedPassword,
        emailVerified: faker.datatype.boolean(0.8) ? faker.date.past() : null,
        isActive: faker.datatype.boolean(0.95),
        image: faker.image.avatar(),
        organizationId,
      },
    });

    // Assign 1-3 roles to each user
    const userRoles = getRandomElements(roles, faker.number.int({ min: 1, max: 3 }));
    for (const role of userRoles) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: role.id }
          }
        }
      });
    }

    users.push(user);
  }

  return users;
}

async function createCategories(organizationId: string) {
  console.log(`Creating categories for organization ${organizationId}...`);
  const categories = [];

  const categoryNames = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports & Outdoors',
    'Toys & Games', 'Automotive', 'Health & Beauty', 'Food & Beverages',
    'Office Supplies', 'Tools & Hardware', 'Baby Products', 'Pet Supplies',
    'Arts & Crafts', 'Musical Instruments'
  ];

  for (let i = 0; i < SEED_CONFIG.categoriesPerOrg; i++) {
    const category = await prisma.category.create({
      data: {
        name: getRandomElement(categoryNames),
        slug: faker.lorem.slug(),
        imageUrl: faker.image.url(),
        description: faker.lorem.paragraph(),
        isActive: faker.datatype.boolean(0.9),
        organizationId,
      },
    });
    categories.push(category);
  }

  return categories;
}

async function createBrands(organizationId: string) {
  console.log(`Creating brands for organization ${organizationId}...`);
  const brands = [];

  for (let i = 0; i < SEED_CONFIG.brandsPerOrg; i++) {
    const brand = await prisma.brand.create({
      data: {
        name: faker.company.name(),
        slug: faker.lorem.slug(),
        imageUrl: faker.image.url(),
        description: faker.lorem.paragraph(),
        isActive: faker.datatype.boolean(0.9),
        organizationId,
      },
    });
    brands.push(brand);
  }

  return brands;
}

async function createUnits(organizationId: string) {
  console.log(`Creating units for organization ${organizationId}...`);
  const units = [];

  const unitNames = [
    'Piece', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'Centimeter',
    'Box', 'Pack', 'Dozen'
  ];

  for (let i = 0; i < SEED_CONFIG.unitsPerOrg; i++) {
    const unit = await prisma.unit.create({
      data: {
        name: getRandomElement(unitNames),
        slug: faker.lorem.slug(),
        abbreviation: faker.string.alpha({ length: { min: 1, max: 4 } }).toUpperCase(),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
      },
    });
    units.push(unit);
  }

  return units;
}

async function createLocations(organizationId: string) {
  console.log(`Creating locations for organization ${organizationId}...`);
  const locations = [];

  for (let i = 0; i < SEED_CONFIG.locationsPerOrg; i++) {
    const location = await prisma.location.create({
      data: {
        name: `${faker.location.city()} ${getRandomElement(['Warehouse', 'Store', 'Branch', 'Outlet'])}`,
        slug: faker.lorem.slug(),
        description: faker.lorem.paragraph(),
        type: getRandomElement(['WAREHOUSE', 'STORE', 'DISTRIBUTION_CENTER']),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        isActive: faker.datatype.boolean(0.9),
        organizationId,
      },
    });
    locations.push(location);
  }

  return locations;
}

async function createTaxRates(organizationId: string) {
  console.log(`Creating tax rates for organization ${organizationId}...`);
  const taxRates = [];

  const taxTypes = ['VAT', 'Sales Tax', 'Service Tax', 'Luxury Tax', 'Import Duty'];

  for (let i = 0; i < SEED_CONFIG.taxRatesPerOrg; i++) {
    const taxRate = await prisma.taxRate.create({
      data: {
        name: `${getRandomElement(taxTypes)} ${faker.number.int({ min: 1, max: 25 })}%`,
        rate: faker.number.float({ min: 0, max: 25, fractionDigits: 2 }),
        description: faker.lorem.sentence(),
        isActive: faker.datatype.boolean(0.9),
        organizationId,
      },
    });
    taxRates.push(taxRate);
  }

  return taxRates;
}

async function createSuppliers(organizationId: string) {
  console.log(`Creating suppliers for organization ${organizationId}...`);
  const suppliers = [];

  for (let i = 0; i < SEED_CONFIG.suppliersPerOrg; i++) {
    const supplier = await prisma.supplier.create({
      data: {
        name: faker.company.name(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        website: faker.internet.url(),
        taxPin: faker.string.alphanumeric(10).toUpperCase(),
        registrationNumber: faker.string.alphanumeric(8).toUpperCase(),
        paymentTerms: getRandomElement(['NET_30', 'NET_60', 'CASH_ON_DELIVERY', 'ADVANCE_PAYMENT']),
        isActive: faker.datatype.boolean(0.9),
        organizationId,
      },
    });
    suppliers.push(supplier);
  }

  return suppliers;
}

async function createItems(organizationId: string, categories: any[], brands: any[], units: any[], suppliers: any[], taxRates: any[]) {
  console.log(`Creating items for organization ${organizationId}...`);
  const items = [];

  for (let i = 0; i < SEED_CONFIG.itemsPerOrg; i++) {
    const item = await prisma.item.create({
      data: {
        name: faker.commerce.productName(),
        slug: faker.lorem.slug(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        barcode: faker.string.numeric(13),
        description: faker.commerce.productDescription(),
        imageUrl: faker.image.url(),

        // Pricing
        buyingPrice: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        sellingPrice: faker.number.float({ min: 20, max: 1500, fractionDigits: 2 }),
        reorderLevel: faker.number.int({ min: 10, max: 100 }),

        // Stock tracking
        trackStock: faker.datatype.boolean(0.8),
        allowNegativeStock: faker.datatype.boolean(0.2),

        // Relationships
        categoryId: getRandomElement(categories).id,
        brandId: getRandomElement(brands).id,
        unitId: getRandomElement(units).id,
        taxRateId: getRandomElement(taxRates).id,

        // Dimensions and weight
        weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
        dimensions: JSON.stringify({
          length: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
          width: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
          height: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
          unit: 'cm',
        }),

        // Additional info
        tags: getRandomElements(['popular', 'new', 'sale', 'featured', 'organic'], faker.number.int({ min: 0, max: 3 })),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
      },
    });

    // Create item-supplier relationships
    const itemSuppliers = getRandomElements(suppliers, faker.number.int({ min: 1, max: 3 }));
    for (const supplier of itemSuppliers) {
      await prisma.itemSupplier.create({
        data: {
          itemId: item.id,
          supplierId: supplier.id,
          supplierSku: faker.string.alphanumeric(10).toUpperCase(),
          leadTimeDays: faker.number.int({ min: 1, max: 30 }),
          minOrderQuantity: faker.number.int({ min: 1, max: 100 }),
          buyingPrice: faker.number.float({ min: 10, max: 800, fractionDigits: 2 }),
          isPreferred: faker.datatype.boolean(0.3),
          isActive: true,
        },
      });
    }

    items.push(item);
  }

  return items;
}

async function createCustomers(organizationId: string) {
  console.log(`Creating customers for organization ${organizationId}...`);
  const customers = [];

  for (let i = 0; i < SEED_CONFIG.customersPerOrg; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const customer = await prisma.customer.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        dateOfBirth: faker.date.birthdate(),
        gender: getRandomElement(['MALE', 'FEMALE', 'OTHER']),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
        loyaltyPoints: faker.number.int({ min: 0, max: 10000 }),
        totalPurchases: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
      },
    });
    customers.push(customer);
  }

  return customers;
}

async function createInventoryTransactions(organizationId: string, items: any[], locations: any[], users: any[]) {
  console.log(`Creating inventory transactions for organization ${organizationId}...`);

  const transactionTypes = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER'];

  for (let i = 0; i < SEED_CONFIG.inventoryMovementsPerOrg; i++) {
    const transactionType = getRandomElement(transactionTypes);
    const quantity = faker.number.int({ min: 1, max: 100 });

    await prisma.inventoryTransaction.create({
      data: {
        itemId: getRandomElement(items).id,
        locationId: getRandomElement(locations).id,
        type: transactionType,
        quantity: transactionType === 'STOCK_OUT' ? -quantity : quantity,
        unitCost: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
        totalCost: faker.number.float({ min: 50, max: 5000, fractionDigits: 2 }),
        reference: faker.string.alphanumeric(10).toUpperCase(),
        notes: faker.lorem.sentence(),
        performedBy: getRandomElement(users).id,
        performedAt: faker.date.past(),
        organizationId,
      },
    });
  }
}

async function createResources(organizationId: string, users: any[]) {
  console.log(`Creating resources for organization ${organizationId}...`);
  const resources = [];

  const resourceTypes = ['DOCUMENT', 'REPORT', 'DASHBOARD', 'FILE', 'FOLDER', 'DATABASE'];

  for (let i = 0; i < 50; i++) {
    const resource = await prisma.resource.create({
      data: {
        resourceType: getRandomElement(resourceTypes),
        name: faker.system.fileName(),
        description: faker.lorem.sentence(),
        ownerId: getRandomElement(users).id,
        visibility: getRandomElement(VISIBILITY_LEVELS),
        isPublic: faker.datatype.boolean(0.3),
        metadata: {
          fileSize: faker.number.int({ min: 1024, max: 1048576 }), // 1KB to 1MB
          mimeType: faker.system.mimeType(),
          lastModified: faker.date.recent(),
          version: faker.system.semver(),
        },
        tags: getRandomElements(['important', 'draft', 'final', 'confidential', 'public'],
               faker.number.int({ min: 0, max: 3 })),
        organizationId,
      },
    });
    resources.push(resource);
  }

  return resources;
}

async function createUserPermissions(users: any[], permissions: any[], resources: any[]) {
  console.log('Creating user permissions...');

  for (let i = 0; i < 100; i++) {
    const user = getRandomElement(users);
    const permission = getRandomElement(permissions);
    const resource = faker.datatype.boolean(0.5) ? getRandomElement(resources) : null;

    await prisma.userPermission.create({
      data: {
        userId: user.id,
        permissionId: permission.id,
        resourceId: resource?.id || null,
        permission: getRandomElement(['GRANT', 'DENY', 'CONDITIONAL']),
        conditions: faker.datatype.boolean(0.4) ? {
          timeWindow: { start: 9, end: 17 },
          ipRestriction: faker.internet.ip(),
          deviceRestriction: faker.datatype.boolean(),
        } : null,
        isActive: faker.datatype.boolean(0.9),
        grantedAt: faker.date.past(),
        grantedBy: getRandomElement(users).id,
        expiresAt: faker.datatype.boolean(0.3) ? faker.date.future() : null,
        justification: faker.lorem.sentence(),
      },
    });
  }
}

async function createResourcePermissions(resources: any[], users: any[]) {
  console.log('Creating resource permissions...');

  for (let i = 0; i < 150; i++) {
    const resource = getRandomElement(resources);
    const user = getRandomElement(users);

    await prisma.resourcePermission.create({
      data: {
        resourceId: resource.id,
        userId: user.id,
        permission: getRandomElement(['READ', 'WRITE', 'DELETE', 'ADMIN']),
        conditions: faker.datatype.boolean(0.3) ? {
          timeRestriction: { start: '09:00', end: '18:00' },
          locationRestriction: faker.location.city(),
        } : null,
        grantedAt: faker.date.past(),
        grantedBy: getRandomElement(users).id,
        expiresAt: faker.datatype.boolean(0.2) ? faker.date.future() : null,
      },
    });
  }
}

async function createPermissionSessions(organizationId: string, users: any[]) {
  console.log(`Creating permission sessions for organization ${organizationId}...`);

  for (let i = 0; i < SEED_CONFIG.permissionSessionsPerOrg; i++) {
    const user = getRandomElement(users);
    const isEmergency = faker.datatype.boolean(0.1);

    await prisma.permissionSession.create({
      data: {
        userId: user.id,
        permissions: getRandomElements(SYSTEM_PERMISSIONS, faker.number.int({ min: 1, max: 10 })),
        reason: isEmergency ? 'Emergency system access required' : faker.lorem.sentence(),
        approvedBy: isEmergency ? getRandomElement(users).id : null,
        approvedAt: isEmergency ? faker.date.recent() : null,
        expiresAt: faker.date.future(),
        isActive: faker.datatype.boolean(0.8),
      },
    });
  }
}

async function createPermissionApprovals(organizationId: string, users: any[], resources: any[]) {
  console.log(`Creating permission approvals for organization ${organizationId}...`);

  for (let i = 0; i < SEED_CONFIG.permissionApprovalsPerOrg; i++) {
    const requester = getRandomElement(users);
    const approver = getRandomElement(users.filter(u => u.id !== requester.id));
    const status = getRandomElement(APPROVAL_STATUSES);

    await prisma.permissionApproval.create({
      data: {
        requestType: getRandomElement(['ROLE_ASSIGNMENT', 'PERMISSION_GRANT', 'RESOURCE_ACCESS', 'EMERGENCY_ACCESS']),
        requesterId: requester.id,
        requestedPermissions: getRandomElements(SYSTEM_PERMISSIONS, faker.number.int({ min: 1, max: 5 })),
        resourceId: faker.datatype.boolean(0.4) ? getRandomElement(resources).id : null,
        justification: faker.lorem.paragraph(),
        approverId: status !== 'pending' ? approver.id : null,
        status,
        approvedAt: status === 'approved' ? faker.date.recent() : null,
        expiresAt: faker.date.future(),
        metadata: {
          priority: getRandomElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
          requestedAt: faker.date.past(),
          riskScore: faker.number.int({ min: 0, max: 100 }),
        },
      },
    });
  }
}

async function createUserSessions(organizationId: string, users: any[]) {
  console.log(`Creating user sessions for organization ${organizationId}...`);

  for (let i = 0; i < 100; i++) {
    const user = getRandomElement(users);
    const isActive = faker.datatype.boolean(0.3);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: faker.string.alphanumeric(32),
        deviceInfo: {
          userAgent: faker.internet.userAgent(),
          browser: getRandomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
          os: getRandomElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
          device: getRandomElement(['Desktop', 'Mobile', 'Tablet']),
          fingerprint: faker.string.alphanumeric(16),
        },
        ipAddress: faker.internet.ip(),
        location: {
          city: faker.location.city(),
          country: faker.location.country(),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
        permissionsSnapshot: getRandomElements(SYSTEM_PERMISSIONS, faker.number.int({ min: 5, max: 20 })),
        riskScore: faker.number.int({ min: 0, max: 100 }),
        isActive,
        lastActivity: isActive ? faker.date.recent() : faker.date.past(),
        expiresAt: faker.date.future(),
      },
    });
  }
}

async function createAuditLogs(organizationId: string, users: any[], resources: any[]) {
  console.log(`Creating audit logs for organization ${organizationId}...`);

  const actions = [
    'USER_LOGIN', 'USER_LOGOUT', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'ROLE_ASSIGNED',
    'ROLE_REMOVED', 'RESOURCE_ACCESSED', 'RESOURCE_CREATED', 'RESOURCE_UPDATED', 'RESOURCE_DELETED',
    'INVENTORY_ADJUSTED', 'SALE_PROCESSED', 'PURCHASE_ORDER_CREATED', 'PASSWORD_CHANGED',
    'EMERGENCY_ACCESS_GRANTED', 'HIGH_RISK_OPERATION', 'APPROVAL_REQUESTED', 'APPROVAL_GRANTED'
  ];

  const resourceTypes = ['USER', 'ROLE', 'PERMISSION', 'RESOURCE', 'ITEM', 'SALE', 'PURCHASE_ORDER'];
  const statuses = ['success', 'failed', 'denied', 'warning'] as const;

  for (let i = 0; i < SEED_CONFIG.auditLogsPerOrg; i++) {
    const user = getRandomElement(users);
    const action = getRandomElement(actions);
    const resourceType = getRandomElement(resourceTypes);
    const status = getRandomElement(statuses);
    const riskLevel = getRandomElement(RISK_LEVELS);

    await prisma.auditLog.create({
      data: {
        timestamp: faker.date.past(),
        userId: user.id,
        sessionId: faker.string.alphanumeric(16),
        action,
        resource: resourceType,
        resourceId: getRandomElement(resources).id,
        permission: getRandomElement(SYSTEM_PERMISSIONS),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        status,
        riskLevel,
        duration: faker.number.int({ min: 100, max: 5000 }), // milliseconds
        permissionContext: {
          userRoles: getRandomElements(['administrator', 'manager', 'cashier'], faker.number.int({ min: 1, max: 2 })),
          sessionDuration: faker.number.int({ min: 1800, max: 28800 }),
          deviceTrusted: faker.datatype.boolean(0.8),
          locationTrusted: faker.datatype.boolean(0.9),
        },
        riskAssessment: JSON.stringify({
          score: faker.number.int({ min: 0, max: 100 }),
          level: riskLevel,
          factors: getRandomElements([
            'unusual_time', 'new_device', 'high_privilege', 'bulk_operation', 'financial_impact'
          ], faker.number.int({ min: 1, max: 3 })),
          mitigationApplied: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
        }),
        approvalChain: riskLevel === 'CRITICAL' ? [getRandomElement(users).id] : [],
        changes: status === 'success' ? {
          before: { status: 'active', value: faker.number.int({ min: 0, max: 1000 }) },
          after: { status: 'modified', value: faker.number.int({ min: 0, max: 1000 }) },
        } : null,
        metadata: {
          component: getRandomElement(['web', 'mobile', 'api', 'system']),
          version: faker.system.semver(),
          requestId: faker.string.uuid(),
        },
        organizationId,
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.permissionApproval.deleteMany();
    await prisma.permissionSession.deleteMany();
    await prisma.resourcePermission.deleteMany();
    await prisma.userPermission.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.inventoryTransaction.deleteMany();
    await prisma.itemSupplier.deleteMany();
    await prisma.item.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.taxRate.deleteMany();
    await prisma.location.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.organization.deleteMany();

    // Create system-wide data
    const permissions = await createPermissions();
    const organizations = await createOrganizations();

    // Create data for each organization
    for (const org of organizations) {
      console.log(`\n🏢 Seeding data for organization: ${org.title}`);

      // Create organizational structure
      const roles = await createRoles(org.id);
      await assignPermissionsToRoles(roles, permissions);
      const users = await createUsers(org.id, roles);

      // Create business data
      const categories = await createCategories(org.id);
      const brands = await createBrands(org.id);
      const units = await createUnits(org.id);
      const locations = await createLocations(org.id);
      const taxRates = await createTaxRates(org.id);
      const suppliers = await createSuppliers(org.id);
      const items = await createItems(org.id, categories, brands, units, suppliers, taxRates);
      const customers = await createCustomers(org.id);

      // Create operational data
      await createInventoryTransactions(org.id, items, locations, users);

      // Create permission and security data
      const resources = await createResources(org.id, users);
      await createUserPermissions(users, permissions, resources);
      await createResourcePermissions(resources, users);
      await createPermissionSessions(org.id, users);
      await createPermissionApprovals(org.id, users, resources);
      await createUserSessions(org.id, users);
      await createAuditLogs(org.id, users, resources);

      console.log(`✅ Completed seeding for ${org.title}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nSeeded data summary:');
    console.log(`📊 Organizations: ${organizations.length}`);
    console.log(`👥 Users: ${organizations.length * SEED_CONFIG.usersPerOrg}`);
    console.log(`🛡️ Roles: ${organizations.length * ROLE_HIERARCHY.length}`);
    console.log(`🔑 Permissions: ${permissions.length}`);
    console.log(`📦 Items: ${organizations.length * SEED_CONFIG.itemsPerOrg}`);
    console.log(`🏪 Customers: ${organizations.length * SEED_CONFIG.customersPerOrg}`);
    console.log(`📋 Audit Logs: ${organizations.length * SEED_CONFIG.auditLogsPerOrg}`);
    console.log(`🔄 Inventory Transactions: ${organizations.length * SEED_CONFIG.inventoryMovementsPerOrg}`);

    console.log('\n🔐 Test Credentials:');
    console.log('Email: Any seeded user email');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });