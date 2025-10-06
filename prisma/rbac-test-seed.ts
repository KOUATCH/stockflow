import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PERMISSIONS, ROLE_TEMPLATES } from '../lib/permissions';

const prisma = new PrismaClient();

// Test configuration
const SEED_CONFIG = {
  organizations: 1, // One organization for testing
  testUsers: 15,    // Variety of users with different roles
};

// Role definitions using the correct permission system
const TEST_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: ['*'], // Wildcard permission for super admin
    userCount: 1
  },
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Administrative access to most features',
    permissions: ROLE_TEMPLATES.ADMIN.permissions,
    userCount: 2
  },
  {
    code: 'MANAGER',
    name: 'Manager',
    description: 'Management level access to operations',
    permissions: ROLE_TEMPLATES.MANAGER.permissions,
    userCount: 3
  },
  {
    code: 'SUPERVISOR',
    name: 'Supervisor',
    description: 'Supervisory access with limited management permissions',
    permissions: ROLE_TEMPLATES.SUPERVISOR.permissions,
    userCount: 3
  },
  {
    code: 'CASHIER',
    name: 'Cashier',
    description: 'POS and sales operations',
    permissions: ROLE_TEMPLATES.CASHIER.permissions,
    userCount: 4
  },
  {
    code: 'INVENTORY_CLERK',
    name: 'Inventory Clerk',
    description: 'Inventory management operations',
    permissions: [
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.CREATE_ITEMS,
      PERMISSIONS.UPDATE_ITEMS,
      PERMISSIONS.MANAGE_INVENTORY_LEVELS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.CREATE_STOCK_ADJUSTMENTS,
      PERMISSIONS.CREATE_STOCK_TRANSFERS,
      PERMISSIONS.RECEIVE_GOODS,
      PERMISSIONS.READ_SUPPLIERS
    ],
    userCount: 2
  }
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function cleanDatabase() {
  console.log('🧹 Cleaning existing test data...');

  // Clean in correct order to respect foreign key constraints
  // First disconnect users from roles
  await prisma.$executeRaw`DELETE FROM "_UserRoles" WHERE 1=1;`;

  // Then clean entities
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function createTestOrganization() {
  console.log('🏢 Creating test organization...');

  const organization = await prisma.organization.create({
    data: {
      name: 'StockFlow Test Company',
      slug: 'stockflow-test-company',
      industry: 'Retail Management',
      country: 'United States',
      state: 'California',
      address: '123 Test Street, Test City',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
    },
  });

  console.log(`✅ Created organization: ${organization.name}`);
  return organization;
}

async function createTestRoles(organizationId: string) {
  console.log('👤 Creating test roles...');
  const roles = [];

  for (const roleConfig of TEST_ROLES) {
    const role = await prisma.role.create({
      data: {
        code: roleConfig.code,
        name: roleConfig.name,
        description: roleConfig.description,
        permissions: roleConfig.permissions,
        organizationId,
      },
    });

    console.log(`  ✓ Created role: ${role.name} (${role.permissions.length} permissions)`);
    roles.push({ ...role, userCount: roleConfig.userCount });
  }

  return roles;
}

async function createTestUsers(organizationId: string, roles: any[]) {
  console.log('👥 Creating test users...');
  const users = [];
  const hashedPassword = await hashPassword('password123');

  let userIndex = 1;

  for (const role of roles) {
    for (let i = 0; i < role.userCount; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const rolePrefix = role.code.toLowerCase().replace('_', '');
      const email = `${rolePrefix}${i + 1}@test.com`;

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
          phone: `+1555${userIndex.toString().padStart(7, '0')}`,
          password: hashedPassword,
          jobTitle: role.name,
          emailVerified: new Date(),
          isActive: true,
          isVerified: true,
          organizationId,
          roles: {
            connect: {
              id: role.id
            }
          }
        },
        include: {
          roles: true
        }
      });

      console.log(`  ✓ Created user: ${user.email} (${role.name})`);
      users.push({ ...user, roleCode: role.code });
      userIndex++;
    }
  }

  return users;
}

async function createBasicTestData(organizationId: string) {
  console.log('📦 Creating basic test data...');

  // Create test categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        title: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        organizationId,
      }
    }),
    prisma.category.create({
      data: {
        title: 'Clothing',
        slug: 'clothing',
        description: 'Apparel and fashion items',
        organizationId,
      }
    }),
    prisma.category.create({
      data: {
        title: 'Books',
        slug: 'books',
        description: 'Books and publications',
        organizationId,
      }
    })
  ]);

  // Create test brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        brandName: 'Test Brand A',
        slug: 'test-brand-a',
        description: 'First test brand',
        organizationId,
      }
    }),
    prisma.brand.create({
      data: {
        brandName: 'Test Brand B',
        slug: 'test-brand-b',
        description: 'Second test brand',
        organizationId,
      }
    })
  ]);

  // Create test units
  const units = await Promise.all([
    prisma.unit.create({
      data: {
        name: 'Piece',
        symbol: 'pcs',
        organizationId,
      }
    }),
    prisma.unit.create({
      data: {
        name: 'Kilogram',
        symbol: 'kg',
        organizationId,
      }
    })
  ]);

  // Create test tax rates
  const taxRates = await Promise.all([
    prisma.taxRate.create({
      data: {
        taxRateName: 'Standard Tax',
        rate: 8.5,
        organizationId,
      }
    }),
    prisma.taxRate.create({
      data: {
        taxRateName: 'Luxury Tax',
        rate: 15.0,
        organizationId,
      }
    })
  ]);

  console.log(`  ✓ Created ${categories.length} categories`);
  console.log(`  ✓ Created ${brands.length} brands`);
  console.log(`  ✓ Created ${units.length} units`);
  console.log(`  ✓ Created ${taxRates.length} tax rates`);

  return { categories, brands, units, taxRates };
}

async function main() {
  console.log('🌱 Starting RBAC test data seeding...');

  try {
    await cleanDatabase();

    const organization = await createTestOrganization();
    const roles = await createTestRoles(organization.id);
    const users = await createTestUsers(organization.id, roles);
    await createBasicTestData(organization.id);

    console.log('\n🎉 RBAC test seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`🏢 Organization: ${organization.name}`);
    console.log(`👤 Roles: ${roles.length}`);
    console.log(`👥 Users: ${users.length}`);

    console.log('\n🔐 Test User Credentials:');
    console.log('Password: password123 (for all users)');
    console.log('\n📧 Test User Emails by Role:');

    for (const role of TEST_ROLES) {
      const roleUsers = users.filter(u => u.roleCode === role.code);
      console.log(`\n${role.name}:`);
      roleUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email}`);
      });
    }

    console.log('\n🎯 Permission Testing Guide:');
    console.log('1. Login with different user roles to test permissions');
    console.log('2. Try accessing different features based on role permissions');
    console.log('3. Test unauthorized access attempts');
    console.log('4. Verify role-based UI restrictions');

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