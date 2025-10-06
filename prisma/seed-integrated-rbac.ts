import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Complete integrated seed configuration
const SEED_CONFIG = {
  organizations: 2, // Reduced for better test data quality
  usersPerOrg: 25,  // More users for comprehensive role testing
  categoriesPerOrg: 12,
  brandsPerOrg: 10,
  unitsPerOrg: 8,
  locationsPerOrg: 6,
  suppliersPerOrg: 15,
  itemsPerOrg: 75,
  customersPerOrg: 40,
  taxRatesPerOrg: 6,
  resourcesPerOrg: 20,
  auditLogsPerOrg: 100,
};

// Enterprise permissions system
const SYSTEM_PERMISSIONS = [
  // Platform Administration (Super Admin only)
  { code: 'PLATFORM_ADMIN', name: 'Platform Administration', resource: 'platform', action: 'admin', category: 'PLATFORM', riskLevel: 'CRITICAL', requiresApproval: true },
  { code: 'SYSTEM_MAINTENANCE', name: 'System Maintenance', resource: 'system', action: 'maintain', category: 'PLATFORM', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'GLOBAL_SETTINGS', name: 'Global Settings Management', resource: 'settings', action: 'manage_global', category: 'PLATFORM', riskLevel: 'HIGH', requiresApproval: true },

  // Organization Management (Organization Owner)
  { code: 'MANAGE_ORGANIZATION', name: 'Manage Organization', resource: 'organization', action: 'manage', category: 'ORGANIZATION', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'VIEW_ORGANIZATION', name: 'View Organization', resource: 'organization', action: 'read', category: 'ORGANIZATION', riskLevel: 'LOW', requiresApproval: false },
  { code: 'UPDATE_ORGANIZATION', name: 'Update Organization', resource: 'organization', action: 'update', category: 'ORGANIZATION', riskLevel: 'MEDIUM', requiresApproval: false },

  // User Management
  { code: 'CREATE_USERS', name: 'Create Users', resource: 'user', action: 'create', category: 'USER_MANAGEMENT', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'READ_USERS', name: 'Read Users', resource: 'user', action: 'read', category: 'USER_MANAGEMENT', riskLevel: 'LOW', requiresApproval: false },
  { code: 'UPDATE_USERS', name: 'Update Users', resource: 'user', action: 'update', category: 'USER_MANAGEMENT', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'DELETE_USERS', name: 'Delete Users', resource: 'user', action: 'delete', category: 'USER_MANAGEMENT', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'MANAGE_USER_ROLES', name: 'Manage User Roles', resource: 'user', action: 'manage_roles', category: 'USER_MANAGEMENT', riskLevel: 'HIGH', requiresApproval: true },

  // Role Management
  { code: 'CREATE_ROLES', name: 'Create Roles', resource: 'role', action: 'create', category: 'ROLE_MANAGEMENT', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'READ_ROLES', name: 'Read Roles', resource: 'role', action: 'read', category: 'ROLE_MANAGEMENT', riskLevel: 'LOW', requiresApproval: false },
  { code: 'UPDATE_ROLES', name: 'Update Roles', resource: 'role', action: 'update', category: 'ROLE_MANAGEMENT', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'DELETE_ROLES', name: 'Delete Roles', resource: 'role', action: 'delete', category: 'ROLE_MANAGEMENT', riskLevel: 'CRITICAL', requiresApproval: true },
  { code: 'ASSIGN_ROLES', name: 'Assign Roles', resource: 'role', action: 'assign', category: 'ROLE_MANAGEMENT', riskLevel: 'HIGH', requiresApproval: true },

  // Permission Management
  { code: 'GRANT_PERMISSIONS', name: 'Grant Permissions', resource: 'permission', action: 'grant', category: 'PERMISSION_MANAGEMENT', riskLevel: 'CRITICAL', requiresApproval: true },
  { code: 'REVOKE_PERMISSIONS', name: 'Revoke Permissions', resource: 'permission', action: 'revoke', category: 'PERMISSION_MANAGEMENT', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'VIEW_PERMISSIONS', name: 'View Permissions', resource: 'permission', action: 'read', category: 'PERMISSION_MANAGEMENT', riskLevel: 'LOW', requiresApproval: false },

  // Inventory Management
  { code: 'CREATE_ITEMS', name: 'Create Items', resource: 'item', action: 'create', category: 'INVENTORY', riskLevel: 'LOW', requiresApproval: false },
  { code: 'READ_ITEMS', name: 'Read Items', resource: 'item', action: 'read', category: 'INVENTORY', riskLevel: 'LOW', requiresApproval: false },
  { code: 'UPDATE_ITEMS', name: 'Update Items', resource: 'item', action: 'update', category: 'INVENTORY', riskLevel: 'LOW', requiresApproval: false },
  { code: 'DELETE_ITEMS', name: 'Delete Items', resource: 'item', action: 'delete', category: 'INVENTORY', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'MANAGE_INVENTORY', name: 'Manage Inventory Levels', resource: 'inventory', action: 'manage', category: 'INVENTORY', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'ADJUST_STOCK', name: 'Adjust Stock', resource: 'inventory', action: 'adjust', category: 'INVENTORY', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'TRANSFER_STOCK', name: 'Transfer Stock', resource: 'inventory', action: 'transfer', category: 'INVENTORY', riskLevel: 'MEDIUM', requiresApproval: false },

  // Sales & POS
  { code: 'OPERATE_POS', name: 'Operate POS', resource: 'pos', action: 'operate', category: 'SALES', riskLevel: 'LOW', requiresApproval: false },
  { code: 'PROCESS_SALES', name: 'Process Sales', resource: 'sales', action: 'process', category: 'SALES', riskLevel: 'LOW', requiresApproval: false },
  { code: 'HANDLE_RETURNS', name: 'Handle Returns', resource: 'sales', action: 'return', category: 'SALES', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'MANAGE_CUSTOMERS', name: 'Manage Customers', resource: 'customer', action: 'manage', category: 'SALES', riskLevel: 'LOW', requiresApproval: false },
  { code: 'ACCESS_CASH_DRAWER', name: 'Access Cash Drawer', resource: 'cash_drawer', action: 'access', category: 'SALES', riskLevel: 'MEDIUM', requiresApproval: false },

  // Financial Management
  { code: 'VIEW_FINANCIAL_REPORTS', name: 'View Financial Reports', resource: 'financial_reports', action: 'read', category: 'FINANCIAL', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'MANAGE_PRICING', name: 'Manage Pricing', resource: 'pricing', action: 'manage', category: 'FINANCIAL', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'MANAGE_TAX_RATES', name: 'Manage Tax Rates', resource: 'tax_rates', action: 'manage', category: 'FINANCIAL', riskLevel: 'HIGH', requiresApproval: true },
  { code: 'EXPORT_FINANCIAL_DATA', name: 'Export Financial Data', resource: 'financial_data', action: 'export', category: 'FINANCIAL', riskLevel: 'HIGH', requiresApproval: true },

  // Audit & Security
  { code: 'VIEW_AUDIT_LOGS', name: 'View Audit Logs', resource: 'audit_logs', action: 'read', category: 'SECURITY', riskLevel: 'MEDIUM', requiresApproval: false },
  { code: 'MANAGE_SECURITY', name: 'Manage Security Settings', resource: 'security', action: 'manage', category: 'SECURITY', riskLevel: 'CRITICAL', requiresApproval: true },
  { code: 'EMERGENCY_ACCESS', name: 'Emergency Access', resource: 'emergency', action: 'access', category: 'SECURITY', riskLevel: 'CRITICAL', requiresApproval: true },

  // Reporting
  { code: 'VIEW_REPORTS', name: 'View Reports', resource: 'reports', action: 'read', category: 'REPORTING', riskLevel: 'LOW', requiresApproval: false },
  { code: 'CREATE_REPORTS', name: 'Create Reports', resource: 'reports', action: 'create', category: 'REPORTING', riskLevel: 'LOW', requiresApproval: false },
  { code: 'EXPORT_REPORTS', name: 'Export Reports', resource: 'reports', action: 'export', category: 'REPORTING', riskLevel: 'MEDIUM', requiresApproval: false },
];

// Role hierarchy with detailed permissions
const ROLE_HIERARCHY = [
  {
    code: 'super_admin',
    name: 'Super Administrator',
    description: 'Platform super administrator with all permissions',
    hierarchyLevel: 1,
    isSystemRole: true,
    permissionCodes: ['PLATFORM_ADMIN', 'SYSTEM_MAINTENANCE', 'GLOBAL_SETTINGS'] // Gets all permissions
  },
  {
    code: 'organization_owner',
    name: 'Organization Owner',
    description: 'Organization owner with full organizational control',
    hierarchyLevel: 2,
    isSystemRole: true,
    permissionCodes: [
      'MANAGE_ORGANIZATION', 'VIEW_ORGANIZATION', 'UPDATE_ORGANIZATION',
      'CREATE_USERS', 'READ_USERS', 'UPDATE_USERS', 'DELETE_USERS', 'MANAGE_USER_ROLES',
      'CREATE_ROLES', 'READ_ROLES', 'UPDATE_ROLES', 'DELETE_ROLES', 'ASSIGN_ROLES',
      'GRANT_PERMISSIONS', 'REVOKE_PERMISSIONS', 'VIEW_PERMISSIONS',
      'MANAGE_SECURITY', 'VIEW_AUDIT_LOGS',
      'MANAGE_PRICING', 'MANAGE_TAX_RATES', 'VIEW_FINANCIAL_REPORTS', 'EXPORT_FINANCIAL_DATA'
    ]
  },
  {
    code: 'administrator',
    name: 'Administrator',
    description: 'System administrator with broad permissions',
    hierarchyLevel: 3,
    isSystemRole: false,
    permissionCodes: [
      'VIEW_ORGANIZATION', 'UPDATE_ORGANIZATION',
      'CREATE_USERS', 'READ_USERS', 'UPDATE_USERS', 'MANAGE_USER_ROLES',
      'READ_ROLES', 'UPDATE_ROLES', 'ASSIGN_ROLES',
      'VIEW_PERMISSIONS',
      'CREATE_ITEMS', 'READ_ITEMS', 'UPDATE_ITEMS', 'DELETE_ITEMS', 'MANAGE_INVENTORY', 'ADJUST_STOCK', 'TRANSFER_STOCK',
      'OPERATE_POS', 'PROCESS_SALES', 'HANDLE_RETURNS', 'MANAGE_CUSTOMERS', 'ACCESS_CASH_DRAWER',
      'VIEW_FINANCIAL_REPORTS', 'MANAGE_PRICING',
      'VIEW_AUDIT_LOGS',
      'VIEW_REPORTS', 'CREATE_REPORTS', 'EXPORT_REPORTS'
    ]
  },
  {
    code: 'manager',
    name: 'Manager',
    description: 'Department manager with operational permissions',
    hierarchyLevel: 4,
    isSystemRole: false,
    permissionCodes: [
      'VIEW_ORGANIZATION',
      'READ_USERS', 'UPDATE_USERS',
      'READ_ROLES',
      'CREATE_ITEMS', 'READ_ITEMS', 'UPDATE_ITEMS', 'MANAGE_INVENTORY', 'ADJUST_STOCK', 'TRANSFER_STOCK',
      'OPERATE_POS', 'PROCESS_SALES', 'HANDLE_RETURNS', 'MANAGE_CUSTOMERS', 'ACCESS_CASH_DRAWER',
      'VIEW_FINANCIAL_REPORTS',
      'VIEW_REPORTS', 'CREATE_REPORTS', 'EXPORT_REPORTS'
    ]
  },
  {
    code: 'supervisor',
    name: 'Supervisor',
    description: 'Shift supervisor with limited management permissions',
    hierarchyLevel: 5,
    isSystemRole: false,
    permissionCodes: [
      'READ_USERS',
      'READ_ITEMS', 'UPDATE_ITEMS', 'MANAGE_INVENTORY', 'ADJUST_STOCK',
      'OPERATE_POS', 'PROCESS_SALES', 'HANDLE_RETURNS', 'MANAGE_CUSTOMERS', 'ACCESS_CASH_DRAWER',
      'VIEW_REPORTS'
    ]
  },
  {
    code: 'cashier',
    name: 'Cashier',
    description: 'Point of sale operator',
    hierarchyLevel: 6,
    isSystemRole: false,
    permissionCodes: [
      'READ_ITEMS',
      'OPERATE_POS', 'PROCESS_SALES', 'HANDLE_RETURNS', 'ACCESS_CASH_DRAWER',
      'VIEW_REPORTS'
    ]
  },
  {
    code: 'inventory_clerk',
    name: 'Inventory Clerk',
    description: 'Inventory management specialist',
    hierarchyLevel: 6,
    isSystemRole: false,
    permissionCodes: [
      'CREATE_ITEMS', 'READ_ITEMS', 'UPDATE_ITEMS', 'MANAGE_INVENTORY', 'ADJUST_STOCK', 'TRANSFER_STOCK',
      'VIEW_REPORTS'
    ]
  },
  {
    code: 'sales_associate',
    name: 'Sales Associate',
    description: 'Basic sales and customer service',
    hierarchyLevel: 7,
    isSystemRole: false,
    permissionCodes: [
      'READ_ITEMS',
      'PROCESS_SALES', 'MANAGE_CUSTOMERS',
      'VIEW_REPORTS'
    ]
  },
  {
    code: 'viewer',
    name: 'Viewer',
    description: 'Read-only access for reporting and viewing',
    hierarchyLevel: 8,
    isSystemRole: false,
    permissionCodes: [
      'READ_ITEMS',
      'VIEW_REPORTS'
    ]
  }
];

// User role distribution for realistic testing
const USER_ROLE_DISTRIBUTION = {
  super_admin: 1,        // 1 per organization
  organization_owner: 1, // 1 per organization
  administrator: 2,      // 2 per organization
  manager: 3,           // 3 per organization
  supervisor: 4,        // 4 per organization
  cashier: 6,          // 6 per organization
  inventory_clerk: 3,   // 3 per organization
  sales_associate: 4,   // 4 per organization
  viewer: 1            // 1 per organization
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

async function createPermissions() {
  console.log('Creating system permissions...');
  const permissions = [];

  for (const permData of SYSTEM_PERMISSIONS) {
    const permission = await prisma.permission.create({
      data: {
        code: permData.code,
        name: permData.name,
        resource: permData.resource,
        action: permData.action,
        description: `${permData.name} - ${permData.resource} ${permData.action}`,
        category: permData.category,
        isSystemPermission: true,
        requiresApproval: permData.requiresApproval,
        riskLevel: permData.riskLevel as any,
      },
    });
    permissions.push(permission);
  }

  console.log(`✅ Created ${permissions.length} system permissions`);
  return permissions;
}

async function createOrganizations() {
  console.log('Creating organizations...');
  const organizations = [];

  for (let i = 0; i < SEED_CONFIG.organizations; i++) {
    const org = await prisma.organization.create({
      data: {
        name: faker.company.name(),
        slug: `${faker.lorem.slug()}-${i}`,
        industry: faker.company.buzzPhrase(),
        country: faker.location.country(),
        state: faker.location.state(),
        address: faker.location.streetAddress(),
        currency: 'USD',
        timezone: 'UTC',
      },
    });
    organizations.push(org);
  }

  console.log(`✅ Created ${organizations.length} organizations`);
  return organizations;
}

async function createRoles(organizationId: string, permissions: any[], systemUserId: string) {
  console.log(`Creating roles for organization ${organizationId}...`);
  const roles = [];

  for (const roleConfig of ROLE_HIERARCHY) {
    // Get permission IDs for this role
    const rolePermissions = permissions.filter(p =>
      roleConfig.permissionCodes.includes(p.code)
    );

    const role = await prisma.role.create({
      data: {
        code: roleConfig.code,
        name: roleConfig.name,
        description: roleConfig.description,
        hierarchyLevel: roleConfig.hierarchyLevel,
        isSystemRole: roleConfig.isSystemRole,
        isActive: true,
        organizationId,
        // Store permission codes as strings array for quick access
        permissions: roleConfig.permissionCodes,
      },
    });

    // Create role-permission relationships
    for (const permission of rolePermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
          grantedBy: systemUserId,
          conditions: roleConfig.hierarchyLevel <= 3 ? undefined : {
            timeRestriction: { start: '09:00', end: '18:00' },
            locationRestriction: 'office',
          },
        },
      });
    }

    roles.push(role);
  }

  console.log(`✅ Created ${roles.length} roles with permissions`);
  return roles;
}

async function createSystemUser(organizationId: string) {
  console.log(`Creating system user for organization ${organizationId}...`);
  const hashedPassword = await hashPassword('system123');

  const systemUser = await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Administrator',
      name: 'System Administrator',
      email: `system.admin@${faker.internet.domainName()}`,
      phone: `+1${faker.string.numeric(10)}`,
      password: hashedPassword,
      jobTitle: 'System Administrator',
      emailVerified: new Date(),
      isActive: true,
      organizationId,
    },
  });

  return systemUser;
}

async function createUsersWithRoles(organizationId: string, roles: any[], systemUserId: string) {
  console.log(`Creating users with role assignments for organization ${organizationId}...`);
  const users = [];
  const hashedPassword = await hashPassword('password123');

  let userIndex = 0;

  // Create users for each role according to distribution
  for (const [roleCode, count] of Object.entries(USER_ROLE_DISTRIBUTION)) {
    const role = roles.find(r => r.code === roleCode);
    if (!role) continue;

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${userIndex}@${faker.internet.domainName()}`;

      // Create job titles based on roles
      const jobTitles = {
        super_admin: 'Super Administrator',
        organization_owner: 'Organization Owner',
        administrator: 'System Administrator',
        manager: 'Department Manager',
        supervisor: 'Shift Supervisor',
        cashier: 'Cashier',
        inventory_clerk: 'Inventory Specialist',
        sales_associate: 'Sales Associate',
        viewer: 'Report Viewer'
      };

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
          phone: `+1${faker.string.numeric(10)}`,
          password: hashedPassword,
          jobTitle: jobTitles[roleCode as keyof typeof jobTitles],
          emailVerified: faker.datatype.boolean(0.9) ? faker.date.past() : null,
          isActive: true,
          image: faker.image.avatar(),
          organizationId,
          roles: {
            connect: { id: role.id }
          }
        },
      });

      // Create individual user permissions for testing
      if (roleCode === 'super_admin') {
        // Super admin gets additional emergency permissions
        const emergencyPermissions = ['EMERGENCY_ACCESS', 'PLATFORM_ADMIN'];
        for (const permCode of emergencyPermissions) {
          const permission = await prisma.permission.findUnique({
            where: { code: permCode }
          });
          if (permission) {
            await prisma.userPermission.create({
              data: {
                userId: user.id,
                permissionId: permission.id,
                grantedBy: systemUserId,
                reason: 'Super Admin Emergency Access',
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              },
            });
          }
        }
      }

      users.push({ ...user, roleCode });
      userIndex++;
    }
  }

  console.log(`✅ Created ${users.length} users with role assignments`);
  return users;
}

async function createCategories(organizationId: string) {
  console.log(`Creating categories for organization ${organizationId}...`);
  const categories = [];

  const categoryNames = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports',
    'Toys', 'Automotive', 'Health', 'Food', 'Office Supplies', 'Beauty', 'Tools'
  ];

  for (let i = 0; i < SEED_CONFIG.categoriesPerOrg; i++) {
    const category = await prisma.category.create({
      data: {
        title: `${categoryNames[i % categoryNames.length]} ${Math.floor(i / categoryNames.length) + 1}`.trim(),
        slug: `${faker.lorem.slug()}-${i}`,
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
        brandName: `${faker.company.name()} ${i + 1}`,
        slug: `${faker.lorem.slug()}-${i}`,
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

  const unitNames = ['Piece', 'Kilogram', 'Liter', 'Meter', 'Box', 'Pack', 'Dozen', 'Set'];

  for (let i = 0; i < SEED_CONFIG.unitsPerOrg; i++) {
    const unit = await prisma.unit.create({
      data: {
        name: `${unitNames[i % unitNames.length]} ${Math.floor(i / unitNames.length) + 1}`.trim(),
        symbol: faker.string.alpha({ length: { min: 1, max: 3 } }).toUpperCase(),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
      },
    });
    units.push(unit);
  }

  return units;
}

async function createTaxRates(organizationId: string) {
  console.log(`Creating tax rates for organization ${organizationId}...`);
  const taxRates = [];

  const taxTypes = ['VAT', 'Sales Tax', 'Service Tax', 'Luxury Tax', 'Import Tax', 'GST'];

  for (let i = 0; i < SEED_CONFIG.taxRatesPerOrg; i++) {
    const taxRate = await prisma.taxRate.create({
      data: {
        taxRateName: `${taxTypes[i % taxTypes.length]} ${Math.floor(i / taxTypes.length) + 1}`,
        rate: faker.number.int({ min: 5, max: 25 }),
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
        name: `${faker.company.name()} ${i + 1}`,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
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
        name: `${faker.commerce.productName()} ${i + 1}`,
        slug: `${faker.lorem.slug()}-${i}`,
        sku: `${faker.string.alphanumeric(6).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        barcode: faker.string.numeric(13),
        description: faker.commerce.productDescription(),
        costPrice: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        sellingPrice: faker.number.float({ min: 20, max: 1500, fractionDigits: 2 }),
        categoryId: getRandomElement(categories).id,
        brandId: getRandomElement(brands).id,
        unitId: getRandomElement(units).id,
        taxRateId: getRandomElement(taxRates).id,
        weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
        imageUrls: faker.image.urlPicsumPhotos(),
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
          isPreferred: faker.datatype.boolean(0.3),
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
        address: faker.location.streetAddress(),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
      },
    });
    customers.push(customer);
  }

  return customers;
}

async function createResources(organizationId: string, users: any[]) {
  console.log(`Creating resources for organization ${organizationId}...`);
  const resources = [];

  const resourceTypes = ['DOCUMENT', 'REPORT', 'DASHBOARD', 'FILE', 'FOLDER', 'SYSTEM'];
  const visibilityLevels = ['PRIVATE', 'ORGANIZATION', 'PUBLIC'];

  for (let i = 0; i < SEED_CONFIG.resourcesPerOrg; i++) {
    const resource = await prisma.resource.create({
      data: {
        resourceType: getRandomElement(resourceTypes),
        resourceId: `${faker.system.fileName()}-${i}`,
        ownerId: getRandomElement(users).id,
        visibility: getRandomElement(visibilityLevels) as any,
        metadata: {
          name: `${faker.system.fileName()} ${i + 1}`,
          description: faker.lorem.sentence(),
          fileSize: faker.number.int({ min: 1024, max: 1048576 }),
          mimeType: faker.system.mimeType(),
          version: faker.system.semver(),
          tags: getRandomElements(['important', 'draft', 'final', 'confidential'],
                 faker.number.int({ min: 0, max: 3 })),
        },
        organizationId,
      },
    });
    resources.push(resource);
  }

  return resources;
}

async function createPermissionSessions(organizationId: string, users: any[]) {
  console.log(`Creating permission sessions for organization ${organizationId}...`);

  const sessionTypes = ['TEMPORARY_ELEVATION', 'EMERGENCY_ACCESS', 'DELEGATION', 'BREAK_GLASS', 'MAINTENANCE'];

  for (let i = 0; i < 10; i++) {
    const user = getRandomElement(users);
    const granter = getRandomElement(users.filter(u => u.id !== user.id));

    await prisma.permissionSession.create({
      data: {
        userId: user.id,
        sessionType: getRandomElement(sessionTypes) as any,
        permissions: getRandomElements(SYSTEM_PERMISSIONS.map(p => p.code), faker.number.int({ min: 1, max: 5 })),
        context: {
          reason: faker.lorem.sentence(),
          duration: '4 hours',
          location: faker.location.city(),
        },
        grantedBy: granter.id,
        expiresAt: faker.date.future(),
        reason: faker.lorem.sentence(),
      },
    });
  }
}

async function createPermissionApprovals(organizationId: string, users: any[], resources: any[]) {
  console.log(`Creating permission approvals for organization ${organizationId}...`);

  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  for (let i = 0; i < 15; i++) {
    const requester = getRandomElement(users);
    const reviewer = getRandomElement(users.filter(u => u.id !== requester.id && ['administrator', 'manager', 'organization_owner'].includes(u.roleCode)));
    const status = getRandomElement(statuses);

    await prisma.permissionApproval.create({
      data: {
        userId: requester.id,
        requestedPermissions: getRandomElements(SYSTEM_PERMISSIONS.map(p => p.code), faker.number.int({ min: 1, max: 3 })),
        resourceId: faker.datatype.boolean(0.5) ? getRandomElement(resources).id : null,
        justification: faker.lorem.paragraph(),
        status: status as any,
        requestedBy: requester.id,
        reviewedBy: status !== 'PENDING' ? reviewer.id : null,
        reviewedAt: status !== 'PENDING' ? faker.date.recent() : null,
        approvedUntil: status === 'APPROVED' ? faker.date.future() : null,
        reviewNotes: status !== 'PENDING' ? faker.lorem.sentence() : null,
      },
    });
  }
}

async function createAuditLogs(organizationId: string, users: any[], resources: any[]) {
  console.log(`Creating audit logs for organization ${organizationId}...`);

  const actions = [
    'USER_LOGIN', 'USER_LOGOUT', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'ROLE_ASSIGNED',
    'ROLE_REMOVED', 'RESOURCE_ACCESSED', 'RESOURCE_CREATED', 'ITEM_CREATED', 'SALE_PROCESSED'
  ];

  const resourceTypes = ['USER', 'ROLE', 'PERMISSION', 'ITEM', 'SALE', 'INVENTORY'];

  for (let i = 0; i < SEED_CONFIG.auditLogsPerOrg; i++) {
    const user = getRandomElement(users);
    const action = getRandomElement(actions);
    const resourceType = getRandomElement(resourceTypes);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        resource: resourceType,
        resourceId: getRandomElement(resources).id,
        oldValues: action.includes('UPDATE') ? { status: 'old_value' } : undefined,
        newValues: action.includes('UPDATE') || action.includes('CREATE') ? { status: 'new_value' } : undefined,
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        organizationId,
        permissionContext: {
          userRole: user.roleCode,
          sessionId: faker.string.uuid(),
          riskLevel: getRandomElement(['LOW', 'MEDIUM', 'HIGH']),
        },
        riskAssessment: getRandomElement(['LOW', 'MEDIUM', 'HIGH']),
        approvalChain: action.includes('HIGH_RISK') ? [getRandomElement(users).id] : [],
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting comprehensive RBAC integrated seeding...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.permissionApproval.deleteMany();
    await prisma.permissionSession.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.resourcePermission.deleteMany();
    await prisma.userPermission.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.itemSupplier.deleteMany();
    await prisma.item.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.taxRate.deleteMany();
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
      console.log(`\n🏢 Seeding data for organization: ${org.name}`);

      // Create system user first for role-permission granting
      const systemUser = await createSystemUser(org.id);

      // Create RBAC structure
      const roles = await createRoles(org.id, permissions, systemUser.id);
      const users = await createUsersWithRoles(org.id, roles, systemUser.id);

      // Create business data
      const categories = await createCategories(org.id);
      const brands = await createBrands(org.id);
      const units = await createUnits(org.id);
      const taxRates = await createTaxRates(org.id);
      const suppliers = await createSuppliers(org.id);
      const items = await createItems(org.id, categories, brands, units, suppliers, taxRates);
      const customers = await createCustomers(org.id);

      // Create RBAC operational data
      const resources = await createResources(org.id, users);
      await createPermissionSessions(org.id, users);
      await createPermissionApprovals(org.id, users, resources);
      await createAuditLogs(org.id, users, resources);

      console.log(`✅ Completed seeding for ${org.name}`);
    }

    console.log('\n🎉 Comprehensive RBAC seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`🏢 Organizations: ${organizations.length}`);
    console.log(`🛡️ System Permissions: ${permissions.length}`);
    console.log(`👤 Roles: ${organizations.length * ROLE_HIERARCHY.length}`);
    console.log(`👥 Users: ${organizations.length * SEED_CONFIG.usersPerOrg}`);
    console.log(`📦 Items: ${organizations.length * SEED_CONFIG.itemsPerOrg}`);
    console.log(`🏪 Customers: ${organizations.length * SEED_CONFIG.customersPerOrg}`);
    console.log(`📁 Resources: ${organizations.length * SEED_CONFIG.resourcesPerOrg}`);
    console.log(`📋 Audit Logs: ${organizations.length * SEED_CONFIG.auditLogsPerOrg}`);

    console.log('\n🔐 Test User Credentials by Role:');
    console.log('Password: password123 (for all users)');
    console.log('\nTo find user emails by role:');
    console.log('```sql');
    console.log('SELECT u.email, u.name, u."jobTitle", r.name as role_name, r.code as role_code');
    console.log('FROM users u');
    console.log('JOIN "_UserRoles" ur ON u.id = ur."A"');
    console.log('JOIN roles r ON ur."B" = r.id');
    console.log('ORDER BY r."hierarchyLevel", u.name;');
    console.log('```');

    console.log('\n🎯 Role Distribution per Organization:');
    Object.entries(USER_ROLE_DISTRIBUTION).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });

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