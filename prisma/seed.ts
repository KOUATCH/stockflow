import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Basic permissions needed for system access
const BASIC_PERMISSIONS = [
  // Wildcard permission for super admin
  '*',
  // Organization & Users
  'MANAGE_ORGANIZATION',
  'VIEW_ORGANIZATION_SETTINGS',
  'CREATE_USERS',
  'READ_USERS',
  'UPDATE_USERS',
  'DELETE_USERS',

  // Roles & Permissions
  'CREATE_ROLES',
  'READ_ROLES',
  'UPDATE_ROLES',
  'DELETE_ROLES',
  'ASSIGN_ROLES',

  // Location Management
  'CREATE_LOCATIONS',
  'READ_LOCATIONS',
  'UPDATE_LOCATIONS',
  'DELETE_LOCATIONS',
  'MANAGE_LOCATION_SETTINGS',

  // Inventory Management
  'CREATE_ITEMS',
  'READ_ITEMS',
  'UPDATE_ITEMS',
  'DELETE_ITEMS',
  'MANAGE_INVENTORY_LEVELS',
  'VIEW_INVENTORY_REPORTS',

  // Categories & Brands
  'CREATE_CATEGORIES',
  'READ_CATEGORIES',
  'UPDATE_CATEGORIES',
  'DELETE_CATEGORIES',
  'CREATE_BRANDS',
  'BRANDS_READ',
  'UPDATE_BRANDS',
  'DELETE_BRANDS',

  // Units
  'CREATE_UNITS',
  'UNITS_READ',
  'UPDATE_UNITS',
  'DELETE_UNITS',

  // Stock Management
  'STOCK_READ',
  'SERIAL_NUMBERS_READ',
  'TRANSFERS_READ',
  'TRANSFERS_CREATE',
  'ADJUSTMENTS_READ',
  'ADJUSTMENTS_CREATE',

  // General Navigation
  'DASHBOARD_READ',

  // Tax Rates
  'TAX_RATES_READ',
  'CREATE_TAX_RATES',
  'UPDATE_TAX_RATES',
  'DELETE_TAX_RATES',

  // Profile & Company Settings
  'PROFILE_READ',
  'COMPANY_READ',
  'PASSWORD_READ',

  // Returns & Orders
  'RETURNS_READ',
  'ORDERS_READ',
  'BLOGS_READ',

  // Analytics & Finance
  'ANALYTICS_READ',
  'FINANCE_READ',
  'CASH_DRAWER_READ',
  'CASH_SYSTEM_READ',

  // POS Sessions
  'NEW_POS_SESSION_READ',
  'POS_STATION_READ',
  'SESSION_POS_SYNC_READ',

  // Purchase Order Workflow
  'PURCHASE_ORDER_WORKFLOW_READ',

  // Recent Inventory
  'RECENT_INVENTORY_READ',

  // Admin
  'ADMIN_READ',

  // Suppliers System
  'SUPPLIERS_SYSTEM_READ',

  // Purchase Orders
  'CREATE_PURCHASE_ORDERS',
  'READ_PURCHASE_ORDERS',
  'UPDATE_PURCHASE_ORDERS',
  'DELETE_PURCHASE_ORDERS',
  'APPROVE_PURCHASE_ORDERS',
  'VIEW_PURCHASE_REPORTS',

  // Sales Orders
  'CREATE_SALES_ORDERS',
  'READ_SALES_ORDERS',
  'UPDATE_SALES_ORDERS',
  'DELETE_SALES_ORDERS',
  'PROCESS_SALES',
  'VIEW_SALES_REPORTS',

  // Stock Management
  'CREATE_STOCK_ADJUSTMENTS',
  'APPROVE_STOCK_ADJUSTMENTS',
  'CREATE_STOCK_TRANSFERS',
  'APPROVE_STOCK_TRANSFERS',
  'RECEIVE_GOODS',

  // Suppliers & Customers
  'CREATE_SUPPLIERS',
  'READ_SUPPLIERS',
  'UPDATE_SUPPLIERS',
  'DELETE_SUPPLIERS',
  'CREATE_CUSTOMERS',
  'READ_CUSTOMERS',
  'UPDATE_CUSTOMERS',
  'DELETE_CUSTOMERS',

  // POS Operations
  'OPERATE_POS',
  'MANAGE_POS_SESSIONS',
  'MANAGE_CASH_DRAWER',
  'PROCESS_PAYMENTS',
  'PROCESS_REFUNDS',
  'VIEW_POS_REPORTS',

  // Financial & Analytics
  'VIEW_FINANCIAL_REPORTS',
  'VIEW_FINANCIAL_DASHBOARD',
  'VIEW_INCOME_STATEMENT',
  'VIEW_BALANCE_SHEET',
  'VIEW_CASH_FLOW_STATEMENT',
  'VIEW_GENERAL_LEDGER',
  'VIEW_JOURNAL_ENTRIES',
  'VIEW_CHART_OF_ACCOUNTS',
  'VIEW_FINANCIAL_RATIOS',
  'VIEW_BUDGETS',
  'VIEW_FINANCIAL_AUDIT_TRAIL',
  'MANAGE_FINANCIAL_PERIODS',
  'VIEW_CASH_MANAGEMENT',
  'VIEW_ANALYTICS',
  'EXPORT_DATA',

  // Presence Monitoring
  'VIEW_OWN_PRESENCE',
  'CLOCK_IN_OUT',
  'MANAGE_OWN_BREAKS',
  'VIEW_OWN_SCHEDULE',
  'VIEW_OWN_ATTENDANCE_REPORTS',
  'VIEW_TEAM_PRESENCE',
  'VIEW_TEAM_OVERVIEW',
  'MANAGE_TEAM_ALERTS',
  'VIEW_SCHEDULES',
  'CREATE_SCHEDULES',
  'UPDATE_SCHEDULES',
  'DELETE_SCHEDULES',
  'VIEW_ORG_ATTENDANCE_REPORTS',
  'GENERATE_ATTENDANCE_REPORTS',

  // Presence Monitoring (Consistent Format)
  'PRESENCE_READ',
  'PRESENCE_CLOCK',
  'PRESENCE_REPORTS_READ',
  'PRESENCE_ALERTS_READ',
  'PRESENCE_TEAM_READ',

  // System Administration
  'MANAGE_SYSTEM_SETTINGS',
  'VIEW_AUDIT_LOGS',
  'MANAGE_INTEGRATIONS',
];

// Simplified seed configuration for testing
const SEED_CONFIG = {
  organizations: 3,
  usersPerOrg: 15,
  categoriesPerOrg: 10,
  brandsPerOrg: 8,
  unitsPerOrg: 6,
  locationsPerOrg: 5,
  suppliersPerOrg: 10,
  itemsPerOrg: 50,
  customersPerOrg: 30,
  taxRatesPerOrg: 5,
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

async function createOrganizations() {
  console.log('Creating organizations...');
  const organizations = [];

  for (let i = 0; i < SEED_CONFIG.organizations; i++) {
    const org = await prisma.organization.create({
      data: {
        name: faker.company.name(),
        slug: faker.lorem.slug(),
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

  return organizations;
}

async function createUsers(organizationId: string) {
  console.log(`Creating users for organization ${organizationId}...`);
  const users = [];
  const hashedPassword = await hashPassword('password123');

  for (let i = 0; i < SEED_CONFIG.usersPerOrg; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@${faker.internet.domainName()}`;

    const jobTitles = ['Sales Associate', 'Manager', 'Cashier', 'Supervisor', 'Assistant Manager', 'Store Manager', 'Customer Service Rep', 'Inventory Clerk'];
    const departments = ['Sales', 'Management', 'Operations', 'Customer Service', 'Finance', 'HR', 'IT', 'Warehouse'];

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone: `+1${faker.string.numeric(10)}`,
        password: hashedPassword,
        emailVerified: faker.datatype.boolean(0.8) ? faker.date.past() : null,
        isActive: faker.datatype.boolean(0.95),
        image: faker.image.avatar(),
        jobTitle: faker.helpers.arrayElement(jobTitles),
        department: faker.helpers.arrayElement(departments),
        hireDate: faker.date.past({ years: 3 }),
        baseSalary: faker.number.int({ min: 30000, max: 120000 }),
        payFrequency: faker.helpers.arrayElement(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
        taxId: `${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(4)}`,
        organizationId,
      },
    });

    users.push(user);
  }

  return users;
}

async function createPermissions() {
  console.log(`Creating permissions...`);
  const permissions = [];

  for (const code of BASIC_PERMISSIONS) {
    // Check if permission already exists
    let permission = await prisma.permission.findUnique({
      where: { code: code }
    });

    if (!permission) {
      // Handle wildcard permission specially
      if (code === '*') {
        permission = await prisma.permission.create({
          data: {
            name: 'Super Admin Access',
            code: '*',
            resource: 'system',
            action: 'all',
            description: 'Wildcard permission granting access to all system resources',
            category: 'system',
            isSystemPermission: true,
          },
        });
      } else {
        permission = await prisma.permission.create({
          data: {
            name: code.replace(/[._]/g, ' ').toLowerCase(),
            code: code,
            resource: code.split(/[._]/)[0].toLowerCase(),
            action: code.split(/[._]/).slice(1).join('_').toLowerCase() || 'access',
            description: `Permission for ${code.toLowerCase().replace(/[._]/g, ' ')}`,
            category: code.split(/[._]/)[0].toLowerCase(),
            isSystemPermission: true,
          },
        });
      }
    }
    permissions.push(permission);
  }

  return permissions;
}

async function createRoles(organizationId: string, permissions: any[]) {
  console.log(`Creating roles for organization ${organizationId}...`);
  const roles = [];

  // Create Super Admin role with wildcard permission
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'Super Administrator',
      code: 'super_admin',
      description: 'Full system access with all permissions',
      permissions: ['*'], // Only wildcard permission
      hierarchyLevel: 1,
      organizationId,
    },
  });

  // Create role-permission relationship only for wildcard permission
  const wildcardPermission = permissions.find(p => p.code === '*');
  if (wildcardPermission) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: wildcardPermission.id,
        grantedAt: new Date(),
      },
    });
  }

  roles.push(superAdminRole);

  // Create Manager role with most permissions
  const managerPermissions = permissions.filter(p =>
    !p.code.includes('DELETE_USERS') &&
    !p.code.includes('MANAGE_SYSTEM_SETTINGS')
  );

  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      code: 'manager',
      description: 'Management role with operational permissions',
      permissions: managerPermissions.map(p => p.code),
      hierarchyLevel: 2,
      organizationId,
    },
  });

  for (const permission of managerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: permission.id,
        grantedAt: new Date(),
      },
    });
  }

  roles.push(managerRole);

  // Create Employee role with basic permissions
  const employeePermissions = permissions.filter(p =>
    p.code.includes('READ_') ||
    p.code.includes('VIEW_') ||
    p.code.includes('OPERATE_POS') ||
    p.code.includes('PRESENCE_') ||
    p.code.includes('DASHBOARD_') ||
    p.code.includes('CLOCK_IN_OUT')
  );

  const employeeRole = await prisma.role.create({
    data: {
      name: 'Employee',
      code: 'employee',
      description: 'Basic employee role with read permissions',
      permissions: employeePermissions.map(p => p.code),
      hierarchyLevel: 3,
      organizationId,
    },
  });

  for (const permission of employeePermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: employeeRole.id,
        permissionId: permission.id,
        grantedAt: new Date(),
      },
    });
  }

  roles.push(employeeRole);

  // Create Supervisor role with mid-level permissions
  const supervisorPermissions = permissions.filter(p =>
    p.code.includes('READ_') ||
    p.code.includes('VIEW_') ||
    p.code.includes('CREATE_SALES_') ||
    p.code.includes('UPDATE_SALES_') ||
    p.code.includes('OPERATE_POS') ||
    p.code.includes('MANAGE_POS_') ||
    p.code.includes('PRESENCE_') ||
    p.code.includes('DASHBOARD_') ||
    p.code.includes('RECEIVE_GOODS')
  );

  const supervisorRole = await prisma.role.create({
    data: {
      name: 'Supervisor',
      code: 'supervisor',
      description: 'Supervisor role with mid-level permissions',
      permissions: supervisorPermissions.map(p => p.code),
      hierarchyLevel: 3,
      organizationId,
    },
  });

  for (const permission of supervisorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: supervisorRole.id,
        permissionId: permission.id,
        grantedAt: new Date(),
      },
    });
  }

  roles.push(supervisorRole);

  // Create Cashier role with POS-focused permissions
  const cashierPermissions = permissions.filter(p =>
    p.code.includes('READ_ITEMS') ||
    p.code.includes('READ_CUSTOMERS') ||
    p.code.includes('CREATE_SALES_') ||
    p.code.includes('PROCESS_SALES') ||
    p.code.includes('OPERATE_POS') ||
    p.code.includes('PROCESS_PAYMENTS') ||
    p.code.includes('PROCESS_REFUNDS') ||
    p.code.includes('PRESENCE_') ||
    p.code.includes('DASHBOARD_')
  );

  const cashierRole = await prisma.role.create({
    data: {
      name: 'Cashier',
      code: 'cashier',
      description: 'Cashier role with POS operations',
      permissions: cashierPermissions.map(p => p.code),
      hierarchyLevel: 4,
      organizationId,
    },
  });

  for (const permission of cashierPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: cashierRole.id,
        permissionId: permission.id,
        grantedAt: new Date(),
      },
    });
  }

  roles.push(cashierRole);

  // Create Viewer role with read-only permissions
  const viewerPermissions = permissions.filter(p =>
    p.code.includes('READ_') ||
    p.code.includes('VIEW_') ||
    p.code.includes('PRESENCE_READ') ||
    p.code.includes('DASHBOARD_')
  );

  const viewerRole = await prisma.role.create({
    data: {
      name: 'Viewer',
      code: 'viewer',
      description: 'Read-only viewer role',
      permissions: viewerPermissions.map(p => p.code),
      hierarchyLevel: 5,
      organizationId,
    },
  });

  for (const permission of viewerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: viewerRole.id,
        permissionId: permission.id,
        grantedAt: new Date(),
      },
    });
  }

  roles.push(viewerRole);

  return roles;
}

async function assignRolesToUsers(users: any[], roles: any[]) {
  console.log(`Assigning roles to users...`);

  const adminRole = roles.find(r => r.code === 'super_admin');
  const managerRole = roles.find(r => r.code === 'manager');
  const supervisorRole = roles.find(r => r.code === 'supervisor');
  const employeeRole = roles.find(r => r.code === 'employee');
  const cashierRole = roles.find(r => r.code === 'cashier');
  const viewerRole = roles.find(r => r.code === 'viewer');

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    let roleToAssign;

    // Assign roles based on user index to ensure variety
    if (i === 0) {
      roleToAssign = adminRole; // First user is super admin
    } else if (i <= 2) {
      roleToAssign = managerRole; // Next 2 are managers
    } else if (i <= 4) {
      roleToAssign = supervisorRole; // Next 2 are supervisors
    } else if (i <= 9) {
      roleToAssign = employeeRole; // Next 5 are employees
    } else if (i <= 12) {
      roleToAssign = cashierRole; // Next 3 are cashiers
    } else {
      roleToAssign = viewerRole || employeeRole; // Rest are viewers (fallback to employee)
    }

    if (roleToAssign) {
      // Update user's roles array and connect to role
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: roleToAssign.id }
          }
        }
      });
    }
  }
}

async function createCategories(organizationId: string) {
  console.log(`Creating categories for organization ${organizationId}...`);
  const categories = [];

  const categoryData = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
    { name: 'Clothing', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500' },
    { name: 'Books', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500' },
    { name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500' },
    { name: 'Toys', image: 'https://images.unsplash.com/photo-1558877385-1e8418aebe52?w=500' },
    { name: 'Automotive', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500' },
    { name: 'Health', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500' },
    { name: 'Food', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500' },
    { name: 'Office Supplies', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' }
  ];

  for (let i = 0; i < SEED_CONFIG.categoriesPerOrg; i++) {
    const categoryInfo = categoryData[i % categoryData.length];
    const category = await prisma.category.create({
      data: {
        title: `${categoryInfo.name} ${Math.floor(i / categoryData.length) + 1}`.trim(),
        slug: `${faker.lorem.slug()}-${i}`,
        description: faker.lorem.paragraph(),
        imageUrl: categoryInfo.image,
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

  const unitNames = ['Piece', 'Kilogram', 'Liter', 'Meter', 'Box', 'Pack', 'Dozen', 'Set', 'Pair', 'Bundle'];

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

  const taxTypes = ['VAT', 'Sales Tax', 'Service Tax', 'Luxury Tax', 'Import Tax'];

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
        name: faker.company.name(),
        // slug: faker.lorem.slug(),
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

  // Category-specific image collections
  const categoryImages = {
    'Electronics': [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500',
      'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=500',
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500'
    ],
    'Clothing': [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500',
      'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=500',
      'https://images.unsplash.com/photo-1517298215822-d3f2bbec14b2?w=500'
    ],
    'Books': [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'
    ],
    'Home & Garden': [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500'
    ],
    'Sports': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      'https://images.unsplash.com/photo-1606986628253-9f7c40dff1b8?w=500',
      'https://images.unsplash.com/photo-1593787204433-beb36cb2676a?w=500',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500'
    ],
    'Food': [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500',
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=500',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
      'https://images.unsplash.com/photo-1559847844-d90f4a1e1cfe?w=500'
    ],
    'default': [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500'
    ]
  };

  for (let i = 0; i < SEED_CONFIG.itemsPerOrg; i++) {
    const selectedCategory = getRandomElement(categories);
    const categoryName = selectedCategory.title.split(' ')[0]; // Get base category name
    const categoryImagePool = categoryImages[categoryName as keyof typeof categoryImages] || categoryImages.default;
    const selectedImage = getRandomElement(categoryImagePool);

    const item = await prisma.item.create({
      data: {
        name: `${faker.commerce.productName()} ${i + 1}`,
        slug: `${faker.lorem.slug()}-${i}`,
        sku: `${faker.string.alphanumeric(6).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        barcode: faker.string.numeric(13),
        description: faker.commerce.productDescription(),
        costPrice: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        sellingPrice: faker.number.float({ min: 20, max: 1500, fractionDigits: 2 }),
        categoryId: selectedCategory.id,
        brandId: getRandomElement(brands).id,
        unitId: getRandomElement(units).id,
        taxRateId: getRandomElement(taxRates).id,
        weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
        isActive: faker.datatype.boolean(0.95),
        organizationId,
        imageUrls: selectedImage,
        thumbnail: selectedImage, // Use same image for thumbnail
      },
    });

    // Create item-supplier relationships
    const itemSuppliers = getRandomElements(suppliers, faker.number.int({ min: 1, max: 2 }));
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
        // slug: faker.lorem.slug(),
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

async function createSuperAdminUser(organizationId: string, roles: any[], orgIndex: number) {
  console.log(`Creating dedicated super admin user...`);
  const hashedPassword = await hashPassword('admin123');

  const superAdminRole = roles.find(r => r.code === 'super_admin');
  if (!superAdminRole) {
    console.log('❌ Super admin role not found');
    return;
  }

  // Use unique email per organization
  const email = orgIndex === 0 ? 'admin@example.com' : `admin${orgIndex + 1}@example.com`;

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email,
      organizationId
    }
  });

  if (existingAdmin) {
    console.log('✅ Super admin already exists');
    return;
  }

  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Administrator',
      name: 'Super Administrator',
      email,
      phone: `+123456789${orgIndex}`,
      password: hashedPassword,
      emailVerified: new Date(),
      isActive: true,
      image: null,
      organizationId,
      roles: {
        connect: { id: superAdminRole.id }
      }
    },
  });

  console.log(`✅ Super admin created: ${email} / admin123`);
}

// ===== POS AND PAYMENT SYSTEM SEEDING FUNCTIONS =====

async function createPOSStations(organizationId: string, locations: any[]) {
  console.log(`🏪 Creating POS stations for organization ${organizationId}...`);
  const posStations = [];

  for (const location of locations) {
    // Create 2-3 POS stations per location
    const stationCount = location.type === 'STORE' ? 3 : location.type === 'WAREHOUSE' ? 1 : 2;

    for (let i = 1; i <= stationCount; i++) {
      const station = await prisma.pOSStation.create({
        data: {
          stationNumber: `${location.code}-POS${i.toString().padStart(2, '0')}-${organizationId.slice(-6)}`,
          name: `${location.name} - Station ${i}`,
          isActive: faker.datatype.boolean(0.95),
          hasCashDrawer: faker.datatype.boolean(0.9),
          locationId: location.id,
          organizationId,
        },
      });
      posStations.push(station);
    }
  }

  console.log(`✅ Created ${posStations.length} POS stations`);
  return posStations;
}

async function createCashDrawers(posStations: any[]) {
  console.log(`💰 Creating cash drawers...`);
  const cashDrawers = [];

  for (const station of posStations) {
    if (station.hasCashDrawer) {
      const drawer = await prisma.cashDrawer.create({
        data: {
          name: `${station.name} - Cash Drawer`,
          drawerNumber: `CD-${station.stationNumber}`,
          currentBalance: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
          expectedBalance: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
          isOpen: faker.datatype.boolean(0.3),
          locationId: station.locationId,
          stationId: station.id,
        },
      });
      cashDrawers.push(drawer);
    }
  }

  console.log(`✅ Created ${cashDrawers.length} cash drawers`);
  return cashDrawers;
}

async function createInventoryLevels(organizationId: string, items: any[], locations: any[]) {
  console.log(`📦 Creating inventory levels...`);
  const inventoryLevels = [];

  for (const item of items) {
    for (const location of locations) {
      // Skip some combinations to make it realistic
      if (Math.random() > 0.8) continue;

      const quantityOnHand = faker.number.int({ min: 0, max: 1000 });
      const quantityReserved = Math.floor(quantityOnHand * 0.1); // 10% reserved
      const quantityAvailable = quantityOnHand - quantityReserved;
      const averageCost = item.costPrice * faker.number.float({ min: 0.9, max: 1.1 });

      const inventoryLevel = await prisma.inventoryLevel.create({
        data: {
          itemId: item.id,
          locationId: location.id,
          quantityOnHand,
          quantityReserved,
          quantityAvailable,
          quantityInTransit: faker.number.int({ min: 0, max: 50 }),
          quantityOnOrder: faker.number.int({ min: 0, max: 100 }),
          reorderPoint: faker.number.int({ min: 10, max: 50 }),
          averageCost,
          totalValue: quantityOnHand * averageCost,
          lastCountDate: faker.date.recent({ days: 30 }),
          lastTransactionAt: faker.date.recent({ days: 7 }),
        },
      });
      inventoryLevels.push(inventoryLevel);
    }
  }

  console.log(`✅ Created ${inventoryLevels.length} inventory levels`);
  return inventoryLevels;
}

async function createPurchaseOrders(organizationId: string, suppliers: any[], locations: any[], items: any[], users: any[]) {
  console.log(`📋 Creating purchase orders...`);
  const purchaseOrders = [];

  for (let i = 0; i < 15; i++) {
    const supplier = getRandomElement(suppliers);
    const location = getRandomElement(locations.filter(l => l.type === 'WAREHOUSE' || l.type === 'STORE'));
    const createdBy = getRandomElement(users);

    const orderDate = faker.date.recent({ days: 60 });
    const expectedDeliveryDate = new Date(orderDate);
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + faker.number.int({ min: 3, max: 14 }));

    const status = getRandomElement(['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'COMPLETED']);

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber: `PO-${faker.string.alphanumeric(6).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        status: status as any,
        orderDate,
        expectedDeliveryDate,
        actualDeliveryDate: status === 'COMPLETED' || status === 'RECEIVED' ? faker.date.between({ from: orderDate, to: new Date() }) : null,
        paymentTerms: `Net ${faker.number.int({ min: 15, max: 60 })}`,
        notes: faker.lorem.sentence(),
        subtotal: 0, // Will be calculated after lines
        taxAmount: 0,
        shippingCost: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        discount: 0,
        total: 0,
        supplierId: supplier.id,
        locationId: location.id,
        organizationId,
        createdById: createdBy.id,
        approvedById: status !== 'DRAFT' ? getRandomElement(users).id : null,
        approvedAt: status !== 'DRAFT' ? faker.date.between({ from: orderDate, to: new Date() }) : null,
      },
    });

    // Create purchase order lines
    const lineCount = faker.number.int({ min: 2, max: 8 });
    let subtotal = 0;

    for (let j = 0; j < lineCount; j++) {
      const item = getRandomElement(items);
      const orderedQuantity = faker.number.int({ min: 10, max: 100 });
      const unitCost = faker.number.float({ min: item.costPrice * 0.8, max: item.costPrice * 1.2, fractionDigits: 2 });
      const lineTotal = orderedQuantity * unitCost;
      subtotal += lineTotal;

      await prisma.purchaseOrderLine.create({
        data: {
          purchaseOrderId: po.id,
          itemId: item.id,
          orderedQuantity,
          receivedQuantity: status === 'COMPLETED' || status === 'RECEIVED' ? orderedQuantity : Math.floor(orderedQuantity * 0.7),
          unitCost,
          discount: 0,
          taxRate: 0,
          taxAmount: 0,
          lineTotal,
          notes: faker.lorem.sentence(),
        },
      });
    }

    // Update totals
    const taxAmount = subtotal * 0.08; // 8% tax
    const total = subtotal + taxAmount + po.shippingCost;

    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        subtotal,
        taxAmount,
        total,
      },
    });

    purchaseOrders.push(po);
  }

  console.log(`✅ Created ${purchaseOrders.length} purchase orders`);
  return purchaseOrders;
}

async function createSalesOrders(organizationId: string, customers: any[], locations: any[], items: any[], users: any[], posStations: any[]) {
  console.log(`🛒 Creating sales orders...`);
  const salesOrders = [];

  for (let i = 0; i < 25; i++) {
    const customer = getRandomElement(customers);
    const location = getRandomElement(locations.filter(l => l.type === 'STORE'));
    const createdBy = getRandomElement(users);
    const station = getRandomElement(posStations.filter(s => s.locationId === location.id));

    const orderDate = faker.date.recent({ days: 30 });
    const status = getRandomElement(['DRAFT', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'COMPLETED']);
    const paymentStatus = getRandomElement(['PENDING', 'PARTIAL', 'PAID']);

    const so = await prisma.salesOrder.create({
      data: {
        orderNumber: `SO-${faker.string.alphanumeric(6).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        status: status as any,
        orderDate,
        dueDate: status !== 'COMPLETED' ? faker.date.future() : null,
        notes: faker.lorem.sentence(),
        subtotal: 0, // Will be calculated after lines
        taxAmount: 0,
        shippingCost: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
        discount: 0,
        total: 0,
        paymentStatus: paymentStatus as any,
        customerId: customer.id,
        locationId: location.id,
        organizationId,
        createdById: createdBy.id,
        stationId: station?.id,
      },
    });

    // Create sales order lines
    const lineCount = faker.number.int({ min: 1, max: 5 });
    let subtotal = 0;

    for (let j = 0; j < lineCount; j++) {
      const item = getRandomElement(items);
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.number.float({ min: item.sellingPrice * 0.9, max: item.sellingPrice * 1.1, fractionDigits: 2 });
      const discount = faker.number.float({ min: 0, max: unitPrice * 0.1, fractionDigits: 2 });
      const taxRate = 0.08; // 8%
      const lineSubtotal = (quantity * unitPrice) - (quantity * discount);
      const taxAmount = lineSubtotal * taxRate;
      const lineTotal = lineSubtotal + taxAmount;
      subtotal += lineTotal;

      await prisma.salesOrderLine.create({
        data: {
          salesOrderId: so.id,
          itemId: item.id,
          quantity,
          unitPrice,
          discount,
          taxRate,
          taxAmount,
          lineTotal,
          notes: j === 0 ? faker.lorem.sentence() : null,
        },
      });
    }

    // Update totals
    const taxAmount = subtotal * 0.08;
    const total = subtotal + so.shippingCost;

    await prisma.salesOrder.update({
      where: { id: so.id },
      data: {
        subtotal,
        taxAmount,
        total,
      },
    });

    salesOrders.push(so);
  }

  console.log(`✅ Created ${salesOrders.length} sales orders`);
  return salesOrders;
}

async function createPayments(salesOrders: any[], purchaseOrders: any[], users: any[]) {
  console.log(`💳 Creating payments...`);
  const payments = [];

  // Create payments for sales orders
  for (const salesOrder of salesOrders) {
    if (salesOrder.paymentStatus === 'PAID' || Math.random() > 0.5) {
      const payment = await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${faker.string.alphanumeric(8).toUpperCase()}`,
          amount: salesOrder.total,
          method: getRandomElement(['CASH', 'CARD', 'DIGITAL']),
          status: salesOrder.paymentStatus === 'PAID' ? 'PAID' : getRandomElement(['PENDING', 'PAID']),
          salesOrderId: salesOrder.id,
          cardType: Math.random() > 0.5 ? getRandomElement(['VISA', 'MASTERCARD', 'AMEX']) : null,
          cardLast4: Math.random() > 0.5 ? faker.string.numeric(4) : null,
          transactionId: faker.string.alphanumeric(16).toUpperCase(),
          authorizationCode: faker.string.alphanumeric(6).toUpperCase(),
          cashTendered: Math.random() > 0.5 ? salesOrder.total + faker.number.float({ min: 0, max: 20 }) : null,
          changeGiven: Math.random() > 0.5 ? faker.number.float({ min: 0, max: 20, fractionDigits: 2 }) : null,
          processedAt: faker.date.recent({ days: 10 }),
          processorResponse: 'APPROVED',
          processedById: getRandomElement(users).id,
          refundedAmount: 0,
          notes: faker.lorem.sentence(),
        },
      });
      payments.push(payment);
    }
  }

  // Create some payments for purchase orders
  for (const purchaseOrder of purchaseOrders) {
    if (purchaseOrder.status === 'COMPLETED' || Math.random() > 0.7) {
      const payment = await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${faker.string.alphanumeric(8).toUpperCase()}`,
          amount: purchaseOrder.total,
          method: getRandomElement(['CARD', 'DIGITAL']),
          status: 'PAID',
          purchaseOrderId: purchaseOrder.id,
          transactionId: faker.string.alphanumeric(16).toUpperCase(),
          processedAt: faker.date.recent({ days: 30 }),
          processorResponse: 'APPROVED',
          processedById: getRandomElement(users).id,
          refundedAmount: 0,
          notes: `Payment for PO ${purchaseOrder.orderNumber}`,
        },
      });
      payments.push(payment);
    }
  }

  console.log(`✅ Created ${payments.length} payments`);
  return payments;
}

async function createStockAdjustments(organizationId: string, items: any[], locations: any[], users: any[]) {
  console.log(`📊 Creating stock adjustments...`);
  const stockAdjustments = [];

  for (let i = 0; i < 8; i++) {
    const location = getRandomElement(locations);
    const createdBy = getRandomElement(users);
    const adjustmentDate = faker.date.recent({ days: 60 });
    const status = getRandomElement(['DRAFT', 'SUBMITTED', 'APPROVED', 'COMPLETED']);

    const adjustment = await prisma.stockAdjustment.create({
      data: {
        adjustmentNumber: `ADJ-${faker.string.alphanumeric(6).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        type: getRandomElement(['CYCLE_COUNT', 'PHYSICAL_COUNT', 'DAMAGED', 'EXPIRED', 'CORRECTION']),
        reason: getRandomElement(['Physical count discrepancy', 'Damaged goods', 'Expired products', 'System correction', 'Cycle count adjustment']),
        status: status as any,
        adjustmentDate,
        notes: faker.lorem.sentence(),
        locationId: location.id,
        organizationId,
        createdById: createdBy.id,
        approvedById: status !== 'DRAFT' ? getRandomElement(users).id : null,
        approvedAt: status !== 'DRAFT' ? faker.date.between({ from: adjustmentDate, to: new Date() }) : null,
      },
    });

    // Create adjustment lines
    const lineCount = faker.number.int({ min: 2, max: 6 });
    for (let j = 0; j < lineCount; j++) {
      const item = getRandomElement(items);
      const systemQuantity = faker.number.int({ min: 50, max: 200 });
      const actualQuantity = systemQuantity + faker.number.int({ min: -20, max: 20 });
      const adjustedQuantity = actualQuantity - systemQuantity;

      await prisma.stockAdjustmentLine.create({
        data: {
          adjustmentId: adjustment.id,
          itemId: item.id,
          systemQuantity,
          actualQuantity,
          adjustedQuantity,
          unitCost: item.costPrice,
          totalCost: Math.abs(adjustedQuantity) * item.costPrice,
          notes: adjustedQuantity !== 0 ? `Adjusted by ${adjustedQuantity}` : 'No adjustment needed',
          serialNumbers: [],
        },
      });
    }

    stockAdjustments.push(adjustment);
  }

  console.log(`✅ Created ${stockAdjustments.length} stock adjustments`);
  return stockAdjustments;
}

async function createStockTransfers(organizationId: string, items: any[], locations: any[], users: any[]) {
  console.log(`🚚 Creating stock transfers...`);
  const stockTransfers = [];

  for (let i = 0; i < 10; i++) {
    const warehouses = locations.filter(l => l.type === 'WAREHOUSE');
    const stores = locations.filter(l => l.type === 'STORE');

    const fromLocation = getRandomElement([...warehouses, ...stores]);
    const toLocation = getRandomElement(locations.filter(l => l.id !== fromLocation.id));
    const createdBy = getRandomElement(users);

    const transferDate = faker.date.recent({ days: 45 });
    const status = getRandomElement(['DRAFT', 'SUBMITTED', 'APPROVED', 'IN_TRANSIT', 'COMPLETED']);

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber: `TR-${faker.string.alphanumeric(6).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        status: status as any,
        transferDate,
        expectedDate: faker.date.future(),
        actualDate: status === 'COMPLETED' ? faker.date.between({ from: transferDate, to: new Date() }) : null,
        notes: faker.lorem.sentence(),
        fromLocationId: fromLocation.id,
        toLocationId: toLocation.id,
        organizationId,
        createdById: createdBy.id,
        approvedById: status !== 'DRAFT' ? getRandomElement(users).id : null,
        approvedAt: status !== 'DRAFT' ? faker.date.between({ from: transferDate, to: new Date() }) : null,
      },
    });

    // Create transfer lines
    const lineCount = faker.number.int({ min: 2, max: 5 });
    for (let j = 0; j < lineCount; j++) {
      const item = getRandomElement(items);
      const requestedQuantity = faker.number.int({ min: 10, max: 50 });
      const shippedQuantity = status === 'COMPLETED' || status === 'IN_TRANSIT' ? requestedQuantity : 0;
      const receivedQuantity = status === 'COMPLETED' ? shippedQuantity : 0;

      await prisma.stockTransferLine.create({
        data: {
          transferId: transfer.id,
          itemId: item.id,
          requestedQuantity,
          shippedQuantity,
          receivedQuantity,
          unitCost: item.costPrice,
          notes: faker.lorem.sentence(),
          serialNumbers: [],
        },
      });
    }

    stockTransfers.push(transfer);
  }

  console.log(`✅ Created ${stockTransfers.length} stock transfers`);
  return stockTransfers;
}

// ===== PRESENCE SYSTEM SEEDING FUNCTIONS =====

async function createEmployeeSchedules(organizationId: string, users: any[], locations: any[]) {
  console.log('📅 Creating employee schedules...');
  const schedules = [];

  for (const user of users) {
    // Create schedule for Monday-Friday (weekdays)
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      const schedule = await prisma.employeeSchedule.create({
        data: {
          userId: user.id,
          organizationId,
          locationId: getRandomElement(locations).id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          breakDurations: [30, 15], // 30min lunch, 15min break
          effectiveFrom: new Date('2024-01-01'),
          notes: `Standard schedule for ${user.firstName} ${user.lastName}`,
        },
      });
      schedules.push(schedule);
    }
  }

  console.log(`✅ Created ${schedules.length} employee schedules`);
  return schedules;
}

async function createPresenceSessions(organizationId: string, users: any[], locations: any[]) {
  console.log('🕐 Creating presence sessions...');
  const sessions = [];

  // Create some completed sessions (last 7 days)
  for (let i = 0; i < 7; i++) {
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - i);

    // Create sessions for random users
    const sessionUsers = users.slice(0, Math.floor(users.length * 0.7)); // 70% of users

    for (const user of sessionUsers) {
      const location = getRandomElement(locations);
      const clockInTime = new Date(sessionDate);
      clockInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0); // 9:00-9:30 AM

      const clockOutTime = new Date(clockInTime);
      clockOutTime.setHours(17, Math.floor(Math.random() * 30), 0, 0); // 5:00-5:30 PM

      const totalMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60));
      const breakMinutes = 45; // 45 minutes of breaks
      const actualWorkMinutes = totalMinutes - breakMinutes;

      const session = await prisma.employeePresenceSession.create({
        data: {
          userId: user.id,
          locationId: location.id,
          organizationId,
          status: 'CLOCKED_OUT',
          clockInTime,
          clockOutTime,
          totalMinutesWorked: actualWorkMinutes,
          totalBreakMinutes: breakMinutes,
          overtime: actualWorkMinutes > 480, // More than 8 hours
          overtimeMinutes: Math.max(0, actualWorkMinutes - 480),
          clockInMethod: getRandomElement(['WEB_BROWSER', 'MOBILE_APP', 'CARD_SWIPE']),
          clockOutMethod: getRandomElement(['WEB_BROWSER', 'MOBILE_APP', 'CARD_SWIPE']),
          notes: i === 0 ? 'Productive day with good customer interactions' : null,
        },
      });
      sessions.push(session);
    }
  }

  // Create some active sessions (today)
  const todayUsers = users.slice(0, Math.floor(users.length * 0.4)); // 40% currently active

  for (const user of todayUsers) {
    const location = getRandomElement(locations);
    const clockInTime = new Date();
    clockInTime.setHours(9, Math.floor(Math.random() * 60), 0, 0); // Clocked in this morning

    const hoursWorked = Math.floor((Date.now() - clockInTime.getTime()) / (1000 * 60 * 60));
    const status = Math.random() > 0.8 ? 'ON_BREAK' : 'CLOCKED_IN';

    const session = await prisma.employeePresenceSession.create({
      data: {
        userId: user.id,
        locationId: location.id,
        organizationId,
        status,
        clockInTime,
        totalMinutesWorked: Math.max(0, hoursWorked * 60 - 30), // Minus break time
        totalBreakMinutes: 30,
        overtime: false,
        overtimeMinutes: 0,
        clockInMethod: getRandomElement(['WEB_BROWSER', 'MOBILE_APP', 'CARD_SWIPE']),
      },
    });
    sessions.push(session);
  }

  console.log(`✅ Created ${sessions.length} presence sessions`);
  return sessions;
}

async function createBreakSessions(sessions: any[]) {
  console.log('☕ Creating break sessions...');
  const breakSessions = [];

  for (const session of sessions) {
    // Create 1-2 break sessions per presence session
    const numBreaks = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numBreaks; i++) {
      const breakType = i === 0 ? 'LUNCH' as const : getRandomElement(['SHORT_BREAK', 'PERSONAL', 'REGULAR'] as const);
      const expectedDuration = breakType === 'LUNCH' ? 30 : 15;

      const startTime = new Date(session.clockInTime);
      startTime.setHours(startTime.getHours() + (i === 0 ? 4 : 2 + i)); // Lunch at +4hrs, others +2hrs

      const endTime = session.status === 'CLOCKED_OUT' ? new Date(startTime.getTime() + expectedDuration * 60000) : null;
      const actualDuration = endTime ? expectedDuration : null;

      const breakSession = await prisma.employeeBreakSession.create({
        data: {
          presenceSessionId: session.id,
          userId: session.userId,
          breakType,
          startTime,
          endTime,
          expectedDuration,
          actualDuration,
          reason: breakType === 'LUNCH' ? 'Lunch break' : breakType === 'PERSONAL' ? 'Personal break' : 'Regular break',
        },
      });
      breakSessions.push(breakSession);
    }
  }

  console.log(`✅ Created ${breakSessions.length} break sessions`);
  return breakSessions;
}

async function createActivityLogs(sessions: any[]) {
  console.log('📋 Creating activity logs...');
  const activityLogs = [];

  for (const session of sessions) {
    // Create activity logs for each session
    const activities: Array<{ type: 'CLOCK_IN' | 'SYSTEM_LOGIN' | 'POS_TRANSACTION' | 'CUSTOMER_SERVICE' | 'CLOCK_OUT'; description: string; timestamp: Date }> = [
      { type: 'CLOCK_IN', description: 'Employee clocked in for shift', timestamp: session.clockInTime },
      { type: 'SYSTEM_LOGIN', description: 'Logged into POS system', timestamp: new Date(session.clockInTime.getTime() + 5 * 60000) },
    ];

    if (session.clockOutTime) {
      activities.push(
        { type: 'POS_TRANSACTION', description: 'Processed customer sale', timestamp: new Date(session.clockInTime.getTime() + 2 * 60 * 60 * 1000) },
        { type: 'CUSTOMER_SERVICE', description: 'Assisted customer with product inquiry', timestamp: new Date(session.clockInTime.getTime() + 4 * 60 * 60 * 1000) },
        { type: 'CLOCK_OUT', description: 'Employee clocked out', timestamp: session.clockOutTime }
      );
    }

    for (const activity of activities) {
      const log = await prisma.employeeActivityLog.create({
        data: {
          presenceSessionId: session.id,
          userId: session.userId,
          activityType: activity.type,
          description: activity.description,
          timestamp: activity.timestamp,
          systemGenerated: activity.type.includes('SYSTEM'),
          metadata: activity.type === 'POS_TRANSACTION' ? { amount: 45.99, transactionId: faker.string.alphanumeric(8) } : undefined,
        },
      });
      activityLogs.push(log);
    }
  }

  console.log(`✅ Created ${activityLogs.length} activity logs`);
  return activityLogs;
}

async function createPresenceAlerts(organizationId: string, users: any[]) {
  console.log('🚨 Creating presence alerts...');
  const alerts = [];

  // Create various types of alerts
  const alertTypes = [
    { type: 'LATE_ARRIVAL' as const, severity: 'MEDIUM' as const, title: 'Late Arrival Detected' },
    { type: 'MISSED_CLOCK_OUT' as const, severity: 'HIGH' as const, title: 'Missed Clock Out' },
    { type: 'EXTENDED_BREAK' as const, severity: 'LOW' as const, title: 'Extended Break Time' },
    { type: 'OVERTIME_ALERT' as const, severity: 'MEDIUM' as const, title: 'Overtime Hours Detected' },
  ];

  for (let i = 0; i < 10; i++) {
    const user = getRandomElement(users);
    const alertInfo = getRandomElement(alertTypes);

    const alert = await prisma.presenceAlert.create({
      data: {
        userId: user.id,
        organizationId,
        alertType: alertInfo.type,
        severity: alertInfo.severity,
        title: alertInfo.title,
        description: `Alert generated for ${user.firstName} ${user.lastName} - ${alertInfo.title.toLowerCase()}`,
        isRead: Math.random() > 0.5,
        isResolved: Math.random() > 0.7,
        metadata: {
          timestamp: new Date(),
          location: 'Main Store',
          details: `Automated alert based on presence monitoring`
        },
      },
    });
    alerts.push(alert);
  }

  console.log(`✅ Created ${alerts.length} presence alerts`);
  return alerts;
}

async function createAttendanceReports(organizationId: string, users: any[], locations: any[]) {
  console.log('📊 Creating attendance reports...');
  const reports = [];

  // Create reports for the last 30 days
  for (let i = 0; i < 30; i++) {
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - i);

    // Create reports for random users
    const reportUsers = users.slice(0, Math.floor(users.length * 0.8)); // 80% of users

    for (const user of reportUsers) {
      const scheduledMinutes = 480; // 8 hours
      const actualMinutes = Math.floor(Math.random() * 60) + 420; // 7-8 hours
      const breakMinutes = 45;
      const lateMinutes = Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0;
      const attendanceScore = Math.min(100, Math.max(0, 100 - (lateMinutes * 2) - Math.max(0, scheduledMinutes - actualMinutes) * 0.5));

      const report = await prisma.attendanceReport.create({
        data: {
          userId: user.id,
          organizationId,
          locationId: getRandomElement(locations).id,
          reportDate,
          scheduledMinutes,
          actualMinutes,
          breakMinutes,
          overtimeMinutes: Math.max(0, actualMinutes - scheduledMinutes),
          lateArrivalMinutes: lateMinutes,
          earlyDepartureMinutes: 0,
          attendanceScore,
          productivity: Math.random() * 20 + 80, // 80-100%
          notes: attendanceScore < 90 ? 'Below target attendance score' : null,
        },
      });
      reports.push(report);
    }
  }

  console.log(`✅ Created ${reports.length} attendance reports`);
  return reports;
}

async function createLocations(organizationId: string) {
  console.log('🏢 Creating locations...');
  const locations = [];

  const locationData = [
    { name: 'Main Store', code: 'MAIN', type: 'STORE' as const, address: '123 Main Street' },
    { name: 'Warehouse', code: 'WH01', type: 'WAREHOUSE' as const, address: '456 Industrial Ave' },
    { name: 'Downtown Branch', code: 'DT01', type: 'STORE' as const, address: '789 Downtown Blvd' },
    { name: 'West Branch', code: 'WB01', type: 'STORE' as const, address: '321 West Side Drive' },
    { name: 'Distribution Center', code: 'DC01', type: 'DISTRIBUTION_CENTER' as const, address: '654 Logistics Way' },
  ];

  for (const data of locationData) {
    const location = await prisma.location.create({
      data: {
        organizationId,
        name: data.name,
        code: data.code,
        type: data.type,
        address: data.address,
        isActive: true,
        isDefault: data.code === 'MAIN',
      },
    });
    locations.push(location);
  }

  console.log(`✅ Created ${locations.length} locations`);
  return locations;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean existing data (skip cleanup on fresh database)
    console.log('🧹 Cleaning existing data...');

    // Helper function to safely delete data
    const safeDelete = async (deleteFunction: () => Promise<any>, name: string) => {
      try {
        await deleteFunction();
      } catch (error: any) {
        if (error.code === 'P2021') {
          console.log(`⚠️ Table ${name} doesn't exist, skipping...`);
        } else {
          throw error;
        }
      }
    };

    // Clean presence system data first (due to foreign key constraints)
    await safeDelete(() => prisma.attendanceReport.deleteMany(), 'attendance_reports');
    await safeDelete(() => prisma.presenceAlert.deleteMany(), 'presence_alerts');
    await safeDelete(() => prisma.employeeActivityLog.deleteMany(), 'employee_activity_logs');
    await safeDelete(() => prisma.employeeBreakSession.deleteMany(), 'employee_break_sessions');
    await safeDelete(() => prisma.employeePresenceSession.deleteMany(), 'employee_presence_sessions');
    await safeDelete(() => prisma.employeeSchedule.deleteMany(), 'employee_schedules');

    // Clean business and transactional data (order matters due to foreign keys)
    await safeDelete(() => prisma.paymentRefund.deleteMany(), 'payment_refunds');
    await safeDelete(() => prisma.payment.deleteMany(), 'payments');
    await safeDelete(() => prisma.stockTransferLine.deleteMany(), 'stock_transfer_lines');
    await safeDelete(() => prisma.stockTransfer.deleteMany(), 'stock_transfers');
    await safeDelete(() => prisma.stockAdjustmentLine.deleteMany(), 'stock_adjustment_lines');
    await safeDelete(() => prisma.stockAdjustment.deleteMany(), 'stock_adjustments');
    await safeDelete(() => prisma.goodsReceiptLine.deleteMany(), 'goods_receipt_lines');
    await safeDelete(() => prisma.goodsReceipt.deleteMany(), 'goods_receipts');
    await safeDelete(() => prisma.purchaseOrderLine.deleteMany(), 'purchase_order_lines');
    await safeDelete(() => prisma.purchaseOrder.deleteMany(), 'purchase_orders');
    await safeDelete(() => prisma.salesOrderLine.deleteMany(), 'sales_order_lines');
    await safeDelete(() => prisma.salesOrder.deleteMany(), 'sales_orders');
    await safeDelete(() => prisma.dailySalesReportCashEvent.deleteMany(), 'daily_sales_report_cash_events');
    await safeDelete(() => prisma.dailySalesReportItem.deleteMany(), 'daily_sales_report_items');
    await safeDelete(() => prisma.dailySalesReport.deleteMany(), 'daily_sales_reports');
    await safeDelete(() => prisma.cashDrawerTransaction.deleteMany(), 'cash_drawer_transactions');
    await safeDelete(() => prisma.pOSSession.deleteMany(), 'pos_sessions');
    await safeDelete(() => prisma.cashDrawer.deleteMany(), 'cash_drawers');
    await safeDelete(() => prisma.pOSStation.deleteMany(), 'pos_stations');
    await safeDelete(() => prisma.inventoryTransaction.deleteMany(), 'inventory_transactions');
    await safeDelete(() => prisma.inventoryLevel.deleteMany(), 'inventory_levels');
    await safeDelete(() => prisma.serialNumber.deleteMany(), 'serial_numbers');
    await safeDelete(() => prisma.itemSupplier.deleteMany(), 'item_suppliers');
    await safeDelete(() => prisma.item.deleteMany(), 'items');
    await safeDelete(() => prisma.customer.deleteMany(), 'customers');
    await safeDelete(() => prisma.supplier.deleteMany(), 'suppliers');
    await safeDelete(() => prisma.taxRate.deleteMany(), 'tax_rates');
    await safeDelete(() => prisma.unit.deleteMany(), 'units');
    await safeDelete(() => prisma.brand.deleteMany(), 'brands');
    await safeDelete(() => prisma.category.deleteMany(), 'categories');
    await safeDelete(() => prisma.location.deleteMany(), 'locations');

    // Clean auth/role data
    await safeDelete(() => prisma.rolePermission.deleteMany(), 'role_permissions');
    await safeDelete(() => prisma.role.deleteMany(), 'roles');
    await safeDelete(() => prisma.permission.deleteMany(), 'permissions');
    await safeDelete(() => prisma.user.deleteMany(), 'users');
    await safeDelete(() => prisma.organization.deleteMany(), 'organizations');

    // Create data
    const organizations = await createOrganizations();

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      console.log(`\n🏢 Seeding data for organization: ${org.name}`);

      // Create permissions and roles first
      const permissions = await createPermissions();
      const roles = await createRoles(org.id, permissions);

      // Create users
      const users = await createUsers(org.id);

      // Assign roles to users
      await assignRolesToUsers(users, roles);

      // Create dedicated super admin user
      await createSuperAdminUser(org.id, roles, i);

      // Create business data
      const locations = await createLocations(org.id);
      const categories = await createCategories(org.id);
      const brands = await createBrands(org.id);
      const units = await createUnits(org.id);
      const taxRates = await createTaxRates(org.id);
      const suppliers = await createSuppliers(org.id);
      const items = await createItems(org.id, categories, brands, units, suppliers, taxRates);
      const customers = await createCustomers(org.id);

      // Create POS and inventory infrastructure
      console.log(`\n🏪 Creating POS infrastructure for ${org.name}...`);
      const posStations = await createPOSStations(org.id, locations);
      const cashDrawers = await createCashDrawers(posStations);
      const inventoryLevels = await createInventoryLevels(org.id, items, locations);

      // Create transactional data
      console.log(`\n💼 Creating business transactions for ${org.name}...`);
      const purchaseOrders = await createPurchaseOrders(org.id, suppliers, locations, items, users);
      const salesOrders = await createSalesOrders(org.id, customers, locations, items, users, posStations);
      const payments = await createPayments(salesOrders, purchaseOrders, users);
      const stockAdjustments = await createStockAdjustments(org.id, items, locations, users);
      const stockTransfers = await createStockTransfers(org.id, items, locations, users);

      // Create presence system data
      console.log(`\n👥 Creating presence system data for ${org.name}...`);
      const schedules = await createEmployeeSchedules(org.id, users, locations);
      const presenceSessions = await createPresenceSessions(org.id, users, locations);
      const breakSessions = await createBreakSessions(presenceSessions);
      const activityLogs = await createActivityLogs(presenceSessions);
      const presenceAlerts = await createPresenceAlerts(org.id, users);
      const attendanceReports = await createAttendanceReports(org.id, users, locations);

      console.log(`✅ Completed seeding for ${org.name}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nSeeded data summary:');
    console.log(`📊 Organizations: ${organizations.length}`);
    console.log(`👥 Users: ${organizations.length * SEED_CONFIG.usersPerOrg}`);
    console.log(`🏢 Locations: ${organizations.length * 5}`);
    console.log(`📦 Items: ${organizations.length * SEED_CONFIG.itemsPerOrg}`);
    console.log(`🏪 Customers: ${organizations.length * SEED_CONFIG.customersPerOrg}`);
    console.log(`🏭 Suppliers: ${organizations.length * SEED_CONFIG.suppliersPerOrg}`);

    console.log(`\n🏪 POS Infrastructure:`);
    console.log(`🖥️ POS Stations: ~${organizations.length * 10} (varies by location type)`);
    console.log(`💰 Cash Drawers: ~${organizations.length * 8}`);
    console.log(`📦 Inventory Levels: ~${organizations.length * Math.floor(SEED_CONFIG.itemsPerOrg * 0.8 * 5)} (80% items across locations)`);

    console.log(`\n💼 Business Transactions:`);
    console.log(`📋 Purchase Orders: ${organizations.length * 15}`);
    console.log(`🛒 Sales Orders: ${organizations.length * 25}`);
    console.log(`💳 Payments: ~${organizations.length * 30} (for orders)`);
    console.log(`📊 Stock Adjustments: ${organizations.length * 8}`);
    console.log(`🚚 Stock Transfers: ${organizations.length * 10}`);

    console.log(`\n👥 Presence System Data:`);
    console.log(`📅 Employee Schedules: ${organizations.length * SEED_CONFIG.usersPerOrg * 5} (Mon-Fri)`);
    console.log(`🕐 Presence Sessions: ~${organizations.length * Math.floor(SEED_CONFIG.usersPerOrg * 0.7) * 7} (last 7 days)`);
    console.log(`☕ Break Sessions: ~${organizations.length * Math.floor(SEED_CONFIG.usersPerOrg * 0.7) * 10}`);
    console.log(`📋 Activity Logs: ~${organizations.length * Math.floor(SEED_CONFIG.usersPerOrg * 0.7) * 35}`);
    console.log(`🚨 Presence Alerts: ${organizations.length * 10}`);
    console.log(`📊 Attendance Reports: ${organizations.length * Math.floor(SEED_CONFIG.usersPerOrg * 0.8) * 30} (last 30 days)`);

    console.log('\n🔐 Test Credentials:');
    console.log('Super Admins:');
    for (let i = 0; i < organizations.length; i++) {
      const email = i === 0 ? 'admin@example.com' : `admin${i + 1}@example.com`;
      console.log(`  Organization ${i + 1}: ${email} / admin123`);
    }
    console.log('Other Users: Any seeded user email / password123');
    console.log('\n🎯 Role Distribution per Organization:');
    console.log('- 1 Super Admin (full access)');
    console.log('- 2 Managers (operational management)');
    console.log('- 2 Supervisors (mid-level permissions)');
    console.log('- 5 Employees (basic operational access)');
    console.log('- 3 Cashiers (POS-focused permissions)');
    console.log('- 2+ Viewers (read-only access)');

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