import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
        organizationId,
      },
    });

    users.push(user);
  }

  return users;
}

async function createCategories(organizationId: string) {
  console.log(`Creating categories for organization ${organizationId}...`);
  const categories = [];

  const categoryNames = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports',
    'Toys', 'Automotive', 'Health', 'Food', 'Office Supplies'
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

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.itemSupplier.deleteMany();
    await prisma.item.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.taxRate.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    // Create data
    const organizations = await createOrganizations();

    for (const org of organizations) {
      console.log(`\n🏢 Seeding data for organization: ${org.name}`);

      const users = await createUsers(org.id);
      const categories = await createCategories(org.id);
      const brands = await createBrands(org.id);
      const units = await createUnits(org.id);
      const taxRates = await createTaxRates(org.id);
      const suppliers = await createSuppliers(org.id);
      const items = await createItems(org.id, categories, brands, units, suppliers, taxRates);
      const customers = await createCustomers(org.id);

      console.log(`✅ Completed seeding for ${org.name}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nSeeded data summary:');
    console.log(`📊 Organizations: ${organizations.length}`);
    console.log(`👥 Users: ${organizations.length * SEED_CONFIG.usersPerOrg}`);
    console.log(`📦 Items: ${organizations.length * SEED_CONFIG.itemsPerOrg}`);
    console.log(`🏪 Customers: ${organizations.length * SEED_CONFIG.customersPerOrg}`);

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