import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../lib/argon2-server';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Test user credentials that will be generated
const TEST_USERS = [
  // Admin Users
  { email: 'admin@stockflow.com', password: 'admin123', name: 'System Administrator', role: 'admin' },
  { email: 'john.admin@stockflow.com', password: 'john123', name: 'John Adams', role: 'admin' },
  { email: 'sarah.admin@stockflow.com', password: 'sarah123', name: 'Sarah Wilson', role: 'admin' },

  // Store Managers
  { email: 'manager@stockflow.com', password: 'manager123', name: 'Store Manager', role: 'store_manager' },
  { email: 'mike.manager@stockflow.com', password: 'mike123', name: 'Mike Johnson', role: 'store_manager' },
  { email: 'emily.manager@stockflow.com', password: 'emily123', name: 'Emily Davis', role: 'store_manager' },
  { email: 'david.manager@stockflow.com', password: 'david123', name: 'David Brown', role: 'store_manager' },
  { email: 'lisa.manager@stockflow.com', password: 'lisa123', name: 'Lisa Garcia', role: 'store_manager' },

  // Cashiers
  { email: 'cashier@stockflow.com', password: 'cashier123', name: 'Main Cashier', role: 'cashier' },
  { email: 'anna.cashier@stockflow.com', password: 'anna123', name: 'Anna Smith', role: 'cashier' },
  { email: 'robert.cashier@stockflow.com', password: 'robert123', name: 'Robert Jones', role: 'cashier' },
  { email: 'maria.cashier@stockflow.com', password: 'maria123', name: 'Maria Rodriguez', role: 'cashier' },
  { email: 'james.cashier@stockflow.com', password: 'james123', name: 'James Miller', role: 'cashier' },
  { email: 'jessica.cashier@stockflow.com', password: 'jessica123', name: 'Jessica Taylor', role: 'cashier' },
  { email: 'michael.cashier@stockflow.com', password: 'michael123', name: 'Michael Anderson', role: 'cashier' },
];

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  try {
    // Clear in reverse dependency order - wrapped in try-catch for fresh databases
    await prisma.dailySalesReportCashEvent.deleteMany().catch(() => {});
    await prisma.dailySalesReportItem.deleteMany().catch(() => {});
    await prisma.dailySalesReport.deleteMany().catch(() => {});
    await prisma.paymentRefund.deleteMany().catch(() => {});
    await prisma.payment.deleteMany().catch(() => {});
    await prisma.cashDrawerTransaction.deleteMany().catch(() => {});
    await prisma.cashDrawer.deleteMany().catch(() => {});
    await prisma.pOSSession.deleteMany().catch(() => {});
    await prisma.pOSStation.deleteMany().catch(() => {});
    await prisma.stockTransferLine.deleteMany().catch(() => {});
    await prisma.stockTransfer.deleteMany().catch(() => {});
    await prisma.stockAdjustmentLine.deleteMany().catch(() => {});
    await prisma.stockAdjustment.deleteMany().catch(() => {});
    await prisma.salesOrderLine.deleteMany().catch(() => {});
    await prisma.salesOrder.deleteMany().catch(() => {});
    await prisma.goodsReceiptLine.deleteMany().catch(() => {});
    await prisma.goodsReceipt.deleteMany().catch(() => {});
    await prisma.purchaseOrderLine.deleteMany().catch(() => {});
    await prisma.purchaseOrder.deleteMany().catch(() => {});
    await prisma.itemSupplier.deleteMany().catch(() => {});
    await prisma.supplier.deleteMany().catch(() => {});
    await prisma.customer.deleteMany().catch(() => {});
    await prisma.serialNumber.deleteMany().catch(() => {});
    await prisma.inventoryTransaction.deleteMany().catch(() => {});
    await prisma.inventoryLevel.deleteMany().catch(() => {});
    await prisma.item.deleteMany().catch(() => {});
    await prisma.taxRate.deleteMany().catch(() => {});
    await prisma.unit.deleteMany().catch(() => {});
    await prisma.brand.deleteMany().catch(() => {});
    await prisma.category.deleteMany().catch(() => {});
    await prisma.location.deleteMany().catch(() => {});
    await prisma.invite.deleteMany().catch(() => {});
    await prisma.role.deleteMany().catch(() => {});
    await prisma.session.deleteMany().catch(() => {});
    await prisma.account.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.organization.deleteMany().catch(() => {});
  } catch (error) {
    console.log('🔄 Fresh database detected, skipping cleanup');
  }

  console.log('✅ Database cleared successfully');
}

async function generateCredentialsFile(users: any[]) {
  const credentialsContent = `# StockFlow Test User Credentials
# Generated on: ${new Date().toISOString()}

## 🔐 Test User Login Credentials

### 👑 Administrators (Full Access)
${users.filter(u => u.role === 'admin').map(u =>
  `- **${u.name}**
  - Email: ${u.email}
  - Password: ${u.password}
  - Role: Administrator`
).join('\n\n')}

### 🏪 Store Managers (Store Management Access)
${users.filter(u => u.role === 'store_manager').map(u =>
  `- **${u.name}**
  - Email: ${u.email}
  - Password: ${u.password}
  - Role: Store Manager`
).join('\n\n')}

### 💰 Cashiers (POS Access)
${users.filter(u => u.role === 'cashier').map(u =>
  `- **${u.name}**
  - Email: ${u.email}
  - Password: ${u.password}
  - Role: Cashier`
).join('\n\n')}

## 🚀 Quick Test Accounts

For quick testing, use these accounts:
- **Admin**: admin@stockflow.com / admin123
- **Manager**: manager@stockflow.com / manager123
- **Cashier**: cashier@stockflow.com / cashier123

## 📝 Generated Faker Users

Additional users have been generated with Faker.js with realistic names and data.
All generated users use the password: **faker123**

## 🏢 Organization Details
- **Name**: StockFlow Retail Enterprise
- **Domain**: stockflow.com
- **Industry**: Retail Management
- **Location**: San Francisco, CA

---
*This file was auto-generated during database seeding. Keep it secure!*
`;

  const filePath = path.join(process.cwd(), 'TEST_CREDENTIALS.md');
  fs.writeFileSync(filePath, credentialsContent, 'utf8');
  console.log(`📋 Test credentials saved to: ${filePath}`);
}

async function main() {
  await clearDatabase();

  console.log('🌱 Starting enhanced database seeding with Faker...');

  // Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'StockFlow Retail Enterprise',
      slug: 'stockflow-retail-enterprise',
      industry: 'Retail Management',
      country: faker.location.country(),
      state: faker.location.state(),
      address: faker.location.streetAddress(),
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      inventoryStartDate: faker.date.past({ years: 1 }),
      fiscalYearStart: '01-01',
    },
  });

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrator',
      code: 'admin',
      description: 'Full system access with all permissions',
      permissions: ['*'],
      organizationId: organization.id,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'Store Manager',
      code: 'store_manager',
      description: 'Store management access with inventory and sales control',
      permissions: [
        'READ_ITEMS', 'CREATE_ITEMS', 'UPDATE_ITEMS',
        'READ_PURCHASE_ORDERS', 'CREATE_PURCHASE_ORDERS',
        'READ_SALES_ORDERS', 'CREATE_SALES_ORDERS',
        'OPERATE_POS', 'VIEW_REPORTS', 'MANAGE_INVENTORY_LEVELS'
      ],
      organizationId: organization.id,
    },
  });

  const cashierRole = await prisma.role.create({
    data: {
      name: 'Cashier',
      code: 'cashier',
      description: 'Point of sale operations and basic inventory access',
      permissions: ['OPERATE_POS', 'READ_ITEMS', 'VIEW_BASIC_REPORTS'],
      organizationId: organization.id,
    },
  });

  const roles = { admin: adminRole, store_manager: managerRole, cashier: cashierRole };

  // Create predefined test users
  const users = [];
  console.log('👥 Creating predefined test users...');

  for (const testUser of TEST_USERS) {
    const hashedPassword = await hashPassword(testUser.password);
    const [firstName, ...lastNameParts] = testUser.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        name: testUser.name,
        firstName: firstName,
        lastName: lastName,
        phone: faker.phone.number(),
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        organizationId: organization.id,
        jobTitle: roles[testUser.role as keyof typeof roles].name,
        image: faker.image.avatar(),
        roles: {
          connect: {
            id: roles[testUser.role as keyof typeof roles].id
          }
        }
      },
    });
    users.push(user);
  }

  // Create additional Faker users
  console.log('🎭 Creating additional users with Faker...');
  const fakerPassword = await hashPassword('faker123');

  for (let i = 0; i < 35; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const roleType = i < 5 ? 'admin' : i < 15 ? 'store_manager' : 'cashier';

    const user = await prisma.user.create({
      data: {
        email: email,
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        phone: faker.phone.number(),
        password: fakerPassword,
        isActive: faker.datatype.boolean({ probability: 0.9 }),
        isVerified: true,
        organizationId: organization.id,
        jobTitle: roles[roleType].name,
        image: faker.image.avatar(),
        roles: {
          connect: {
            id: roles[roleType].id
          }
        }
      },
    });
    users.push(user);
  }

  // Create Locations with Faker
  console.log('🏢 Creating locations...');
  const locations = [];
  const locationTypes = ['WAREHOUSE', 'STORE', 'DISTRIBUTION_CENTER'];

  for (let i = 1; i <= 55; i++) {
    const location = await prisma.location.create({
      data: {
        name: `${faker.company.name()} ${locationTypes[i % 3]}`,
        code: `LOC${String(i).padStart(3, '0')}`,
        type: locationTypes[i % 3] as any,
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        isActive: faker.datatype.boolean({ probability: 0.85 }),
        isDefault: i === 1,
        organizationId: organization.id,
        managerId: users[i % users.length].id,
        allowNegativeStock: faker.datatype.boolean({ probability: 0.3 }),
        requiresApproval: faker.datatype.boolean({ probability: 0.5 }),
      },
    });
    locations.push(location);
  }

  // Create Categories with realistic data
  console.log('📂 Creating categories...');
  const categories = [];
  const categoryData = [
    { name: 'Electronics & Technology', desc: 'Computers, phones, accessories' },
    { name: 'Fashion & Apparel', desc: 'Clothing, shoes, accessories' },
    { name: 'Food & Beverages', desc: 'Groceries, snacks, drinks' },
    { name: 'Home & Garden', desc: 'Furniture, decor, gardening' },
    { name: 'Sports & Recreation', desc: 'Fitness, outdoor, sports equipment' },
    { name: 'Books & Media', desc: 'Books, movies, music' },
    { name: 'Health & Beauty', desc: 'Cosmetics, skincare, wellness' },
    { name: 'Automotive', desc: 'Car parts, accessories, tools' },
    { name: 'Toys & Games', desc: 'Children toys, board games' },
    { name: 'Office Supplies', desc: 'Stationery, equipment, furniture' },
    { name: 'Kitchen & Dining', desc: 'Cookware, appliances, utensils' },
    { name: 'Pet Supplies', desc: 'Pet food, toys, accessories' },
    { name: 'Tools & Hardware', desc: 'Hand tools, power tools, hardware' },
    { name: 'Arts & Crafts', desc: 'Art supplies, craft materials' },
    { name: 'Musical Instruments', desc: 'Instruments, audio equipment' },
  ];

  for (const catData of categoryData) {
    const category = await prisma.category.create({
      data: {
        title: catData.name,
        slug: catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catData.desc,
        imageUrl: faker.image.url({ width: 400, height: 300 }),
        isActive: faker.datatype.boolean({ probability: 0.9 }),
        organizationId: organization.id,
      },
    });
    categories.push(category);
  }

  // Create Brands with Faker
  console.log('🏷️ Creating brands...');
  const brands = [];
  for (let i = 0; i < 60; i++) {
    const brandName = faker.company.name();
    const brand = await prisma.brand.create({
      data: {
        brandName: brandName,
        slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: faker.company.catchPhrase(),
        logoUrl: faker.image.url({ width: 200, height: 200 }),
        isActive: faker.datatype.boolean({ probability: 0.85 }),
        organizationId: organization.id,
      },
    });
    brands.push(brand);
  }

  // Create realistic Units
  console.log('📏 Creating units...');
  const units = [];
  const unitData = [
    { name: 'Piece', symbol: 'pcs', type: 'QUANTITY' },
    { name: 'Kilogram', symbol: 'kg', type: 'WEIGHT' },
    { name: 'Liter', symbol: 'L', type: 'VOLUME' },
    { name: 'Meter', symbol: 'm', type: 'LENGTH' },
    { name: 'Box', symbol: 'box', type: 'QUANTITY' },
    { name: 'Pack', symbol: 'pack', type: 'QUANTITY' },
    { name: 'Dozen', symbol: 'dz', type: 'QUANTITY' },
    { name: 'Gram', symbol: 'g', type: 'WEIGHT' },
    { name: 'Pair', symbol: 'pair', type: 'QUANTITY' },
    { name: 'Set', symbol: 'set', type: 'QUANTITY' },
    { name: 'Bundle', symbol: 'bdl', type: 'QUANTITY' },
    { name: 'Carton', symbol: 'ctn', type: 'QUANTITY' },
    { name: 'Case', symbol: 'cs', type: 'QUANTITY' },
    { name: 'Milliliter', symbol: 'mL', type: 'VOLUME' },
    { name: 'Gallon', symbol: 'gal', type: 'VOLUME' },
    { name: 'Pound', symbol: 'lb', type: 'WEIGHT' },
    { name: 'Ounce', symbol: 'oz', type: 'WEIGHT' },
    { name: 'Foot', symbol: 'ft', type: 'LENGTH' },
    { name: 'Inch', symbol: 'in', type: 'LENGTH' },
    { name: 'Yard', symbol: 'yd', type: 'LENGTH' },
    { name: 'Square Meter', symbol: 'm²', type: 'AREA' },
    { name: 'Square Foot', symbol: 'ft²', type: 'AREA' },
    { name: 'Hour', symbol: 'hr', type: 'TIME' },
    { name: 'Minute', symbol: 'min', type: 'TIME' },
    { name: 'Day', symbol: 'day', type: 'TIME' },
    { name: 'Week', symbol: 'wk', type: 'TIME' },
    { name: 'Month', symbol: 'mo', type: 'TIME' },
    { name: 'Roll', symbol: 'roll', type: 'QUANTITY' },
    { name: 'Sheet', symbol: 'sht', type: 'QUANTITY' },
    { name: 'Tablet', symbol: 'tab', type: 'QUANTITY' },
    { name: 'Capsule', symbol: 'cap', type: 'QUANTITY' },
    { name: 'Bottle', symbol: 'btl', type: 'QUANTITY' },
    { name: 'Can', symbol: 'can', type: 'QUANTITY' },
    { name: 'Jar', symbol: 'jar', type: 'QUANTITY' },
    { name: 'Tube', symbol: 'tube', type: 'QUANTITY' },
    { name: 'Sachet', symbol: 'sach', type: 'QUANTITY' },
    { name: 'Pouch', symbol: 'pouch', type: 'QUANTITY' },
    { name: 'Bag', symbol: 'bag', type: 'QUANTITY' },
    { name: 'Sack', symbol: 'sack', type: 'QUANTITY' },
    { name: 'Barrel', symbol: 'bbl', type: 'VOLUME' },
    { name: 'Tonne', symbol: 't', type: 'WEIGHT' },
    { name: 'Centimeter', symbol: 'cm', type: 'LENGTH' },
    { name: 'Millimeter', symbol: 'mm', type: 'LENGTH' },
    { name: 'Kilometer', symbol: 'km', type: 'LENGTH' },
    { name: 'Cubic Meter', symbol: 'm³', type: 'VOLUME' },
    { name: 'Cubic Foot', symbol: 'ft³', type: 'VOLUME' },
    { name: 'Pint', symbol: 'pt', type: 'VOLUME' },
    { name: 'Quart', symbol: 'qt', type: 'VOLUME' },
    { name: 'Cup', symbol: 'cup', type: 'VOLUME' },
    { name: 'Tablespoon', symbol: 'tbsp', type: 'VOLUME' },
    { name: 'Teaspoon', symbol: 'tsp', type: 'VOLUME' },
  ];

  for (const unitInfo of unitData) {
    const unit = await prisma.unit.create({
      data: {
        name: unitInfo.name,
        symbol: unitInfo.symbol,
        type: unitInfo.type as any,
        isActive: true,
        organizationId: organization.id,
      },
    });
    units.push(unit);
  }

  // Create Tax Rates
  console.log('💰 Creating tax rates...');
  const taxRates = [];
  const taxData = [
    { name: 'Standard Sales Tax', rate: 8.5, type: 'SALES' },
    { name: 'Luxury Tax', rate: 15.0, type: 'SALES' },
    { name: 'Food Tax', rate: 2.5, type: 'SALES' },
    { name: 'VAT Standard', rate: 20.0, type: 'VAT' },
    { name: 'Electronics Tax', rate: 7.5, type: 'SALES' },
    { name: 'No Tax', rate: 0.0, type: 'SALES' },
    { name: 'Reduced VAT', rate: 5.0, type: 'VAT' },
    { name: 'GST Standard', rate: 10.0, type: 'GST' },
    { name: 'GST Reduced', rate: 5.0, type: 'GST' },
    { name: 'Import Duty', rate: 12.0, type: 'IMPORT' },
    { name: 'Export Tax', rate: 3.0, type: 'EXPORT' },
    { name: 'Excise Duty', rate: 25.0, type: 'EXCISE' },
    { name: 'Alcohol Tax', rate: 30.0, type: 'EXCISE' },
    { name: 'Tobacco Tax', rate: 40.0, type: 'EXCISE' },
    { name: 'Fuel Tax', rate: 18.0, type: 'EXCISE' },
    { name: 'City Sales Tax', rate: 2.0, type: 'SALES' },
    { name: 'State Sales Tax', rate: 6.0, type: 'SALES' },
    { name: 'County Tax', rate: 1.5, type: 'SALES' },
    { name: 'Special District Tax', rate: 0.5, type: 'SALES' },
    { name: 'Environmental Tax', rate: 2.0, type: 'SALES' },
  ];

  for (const taxInfo of taxData) {
    const taxRate = await prisma.taxRate.create({
      data: {
        taxRateName: taxInfo.name,
        rate: taxInfo.rate,
        type: taxInfo.type as any,
        isActive: true,
        organizationId: organization.id,
      },
    });
    taxRates.push(taxRate);
  }

  // Create Items with realistic Faker data
  console.log('📦 Creating items...');
  const items = [];
  for (let i = 0; i < 150; i++) {
    const productName = `${faker.commerce.productName()} #${i + 1}`;
    const costPrice = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
    const sellingPrice = costPrice * (1.3 + Math.random() * 0.7); // 30-100% markup

    const item = await prisma.item.create({
      data: {
        name: productName,
        slug: `${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
        sku: `SKU${String(i + 1).padStart(6, '0')}`,
        barcode: faker.string.numeric(12),
        description: faker.commerce.productDescription(),
        imageUrls: faker.image.url({ width: 400, height: 400 }),
        thumbnail: faker.image.url({ width: 200, height: 200 }),
        upc: faker.string.numeric(12),
        ean: faker.string.numeric(13),
        mpn: faker.string.alphanumeric(8).toUpperCase(),
        dimensions: `${faker.number.int({ min: 5, max: 50 })}x${faker.number.int({ min: 5, max: 50 })}x${faker.number.int({ min: 5, max: 50 })}cm`,
        weight: faker.number.float({ min: 0.1, max: 20, fractionDigits: 2 }),
        color: faker.color.human(),
        size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']),
        costPrice: costPrice,
        sellingPrice: sellingPrice,
        msrp: sellingPrice * 1.2,
        trackInventory: faker.datatype.boolean({ probability: 0.9 }),
        trackSerialNumbers: faker.datatype.boolean({ probability: 0.2 }),
        trackBatches: faker.datatype.boolean({ probability: 0.3 }),
        trackExpiry: faker.datatype.boolean({ probability: 0.25 }),
        minStockLevel: faker.number.int({ min: 5, max: 50 }),
        maxStockLevel: faker.number.int({ min: 100, max: 1000 }),
        reorderLevel: faker.number.int({ min: 10, max: 100 }),
        reorderQuantity: faker.number.int({ min: 25, max: 200 }),
        isActive: faker.datatype.boolean({ probability: 0.85 }),
        isDiscontinued: faker.datatype.boolean({ probability: 0.1 }),
        organizationId: organization.id,
        categoryId: categories[i % categories.length].id,
        brandId: brands[i % brands.length].id,
        unitId: units[i % units.length].id,
        taxRateId: taxRates[i % taxRates.length].id,
      },
    });
    items.push(item);
  }

  // Create Suppliers with Faker
  console.log('🏭 Creating suppliers...');
  const suppliers = [];
  for (let i = 0; i < 65; i++) {
    const companyName = faker.company.name();
    const supplier = await prisma.supplier.create({
      data: {
        name: companyName,
        code: `SUP${String(i + 1).padStart(4, '0')}`,
        contactPerson: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
        taxId: faker.string.alphanumeric(10).toUpperCase(),
        paymentTerms: faker.helpers.arrayElement([15, 30, 45, 60]),
        creditLimit: faker.number.int({ min: 10000, max: 100000 }),
        notes: faker.lorem.sentence(),
        isActive: faker.datatype.boolean({ probability: 0.9 }),
        organizationId: organization.id,
      },
    });
    suppliers.push(supplier);
  }

  // Create Customers with Faker
  console.log('👥 Creating customers...');
  const customers = [];
  for (let i = 0; i < 75; i++) {
    const fullName = faker.person.fullName();
    const customer = await prisma.customer.create({
      data: {
        name: fullName,
        code: `CUST${String(i + 1).padStart(4, '0')}`,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        taxId: faker.datatype.boolean({ probability: 0.3 }) ? faker.string.alphanumeric(9).toUpperCase() : null,
        creditLimit: faker.number.int({ min: 500, max: 5000 }),
        paymentTerms: 30,
        notes: faker.lorem.sentence(),
        isActive: faker.datatype.boolean({ probability: 0.95 }),
        organizationId: organization.id,
      },
    });
    customers.push(customer);
  }

  // Create Inventory Levels
  console.log('📊 Creating inventory levels...');
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < Math.min(5, locations.length); j++) {
      const quantityOnHand = faker.number.int({ min: 0, max: 500 });
      const quantityReserved = faker.number.int({ min: 0, max: Math.floor(quantityOnHand * 0.3) });

      await prisma.inventoryLevel.create({
        data: {
          itemId: items[i].id,
          locationId: locations[j].id,
          quantityOnHand: quantityOnHand,
          quantityReserved: quantityReserved,
          quantityAvailable: quantityOnHand - quantityReserved,
          quantityInTransit: faker.number.int({ min: 0, max: 50 }),
          quantityOnOrder: faker.number.int({ min: 0, max: 100 }),
          reorderPoint: items[i].reorderLevel,
          averageCost: items[i].costPrice,
          totalValue: quantityOnHand * items[i].costPrice,
          lastCountDate: faker.date.recent(),
          lastTransactionAt: faker.date.recent(),
        },
      });
    }
  }

  // Create sample Purchase Orders
  console.log('📋 Creating purchase orders...');
  const purchaseOrders = [];
  for (let i = 1; i <= 60; i++) {
    const supplier = faker.helpers.arrayElement(suppliers);
    const location = faker.helpers.arrayElement(locations);
    const user = faker.helpers.arrayElement(users);

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber: `PO${String(i).padStart(6, '0')}`,
        status: faker.helpers.arrayElement(['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED']),
        orderDate: faker.date.recent(),
        expectedDeliveryDate: faker.date.future(),
        paymentTerms: `${supplier.paymentTerms} days`,
        notes: faker.lorem.sentence(),
        internalNotes: faker.lorem.sentence(),
        subtotal: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
        taxAmount: faker.number.float({ min: 40, max: 400, fractionDigits: 2 }),
        shippingCost: faker.number.float({ min: 25, max: 200, fractionDigits: 2 }),
        discount: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        total: faker.number.float({ min: 600, max: 5500, fractionDigits: 2 }),
        supplierId: supplier.id,
        locationId: location.id,
        organizationId: organization.id,
        createdById: user.id,
        approvedById: faker.datatype.boolean({ probability: 0.7 }) ? faker.helpers.arrayElement(users).id : null,
        approvedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent() : null,
      },
    });
    purchaseOrders.push(po);
  }

  // Create Sales Orders
  console.log('🛒 Creating sales orders...');
  const salesOrders = [];
  for (let i = 1; i <= 80; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const location = faker.helpers.arrayElement(locations);
    const user = faker.helpers.arrayElement(users);

    const so = await prisma.salesOrder.create({
      data: {
        orderNumber: `SO${String(i).padStart(6, '0')}`,
        status: faker.helpers.arrayElement(['DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED']),
        orderDate: faker.date.recent(),
        dueDate: faker.date.future(),
        notes: faker.lorem.sentence(),
        subtotal: faker.number.float({ min: 100, max: 2000, fractionDigits: 2 }),
        taxAmount: faker.number.float({ min: 8, max: 160, fractionDigits: 2 }),
        shippingCost: faker.number.float({ min: 10, max: 50, fractionDigits: 2 }),
        discount: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        total: faker.number.float({ min: 120, max: 2100, fractionDigits: 2 }),
        paymentStatus: faker.helpers.arrayElement(['PENDING', 'PARTIAL', 'PAID']),
        customerId: customer.id,
        locationId: location.id,
        organizationId: organization.id,
        createdById: user.id,
      },
    });
    salesOrders.push(so);
  }

  // Create Stock Adjustments
  console.log('📊 Creating stock adjustments...');
  const stockAdjustments = [];
  for (let i = 1; i <= 55; i++) {
    const location = faker.helpers.arrayElement(locations);
    const user = faker.helpers.arrayElement(users);

    const adjustment = await prisma.stockAdjustment.create({
      data: {
        adjustmentNumber: `ADJ${String(i).padStart(6, '0')}`,
        type: faker.helpers.arrayElement(['CYCLE_COUNT', 'PHYSICAL_COUNT', 'DAMAGED', 'EXPIRED', 'THEFT', 'WRITE_OFF', 'FOUND', 'CORRECTION', 'OTHER']),
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['DRAFT', 'SUBMITTED', 'APPROVED', 'COMPLETED']),
        adjustmentDate: faker.date.recent(),
        notes: faker.lorem.paragraph(),
        locationId: location.id,
        organizationId: organization.id,
        createdById: user.id,
        approvedById: faker.datatype.boolean({ probability: 0.6 }) ? faker.helpers.arrayElement(users).id : null,
        approvedAt: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent() : null,
      },
    });
    stockAdjustments.push(adjustment);
  }

  // Create Stock Transfers
  console.log('🔄 Creating stock transfers...');
  const stockTransfers = [];
  for (let i = 1; i <= 50; i++) {
    const fromLocation = faker.helpers.arrayElement(locations);
    let toLocation = faker.helpers.arrayElement(locations);
    // Ensure different locations
    while (toLocation.id === fromLocation.id) {
      toLocation = faker.helpers.arrayElement(locations);
    }
    const user = faker.helpers.arrayElement(users);

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber: `TRF${String(i).padStart(6, '0')}`,
        status: faker.helpers.arrayElement(['DRAFT', 'SUBMITTED', 'APPROVED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'COMPLETED']),
        transferDate: faker.date.recent(),
        expectedDate: faker.date.future(),
        actualDate: faker.datatype.boolean({ probability: 0.5 }) ? faker.date.recent() : null,
        notes: faker.lorem.sentence(),
        fromLocationId: fromLocation.id,
        toLocationId: toLocation.id,
        organizationId: organization.id,
        createdById: user.id,
        approvedById: faker.datatype.boolean({ probability: 0.7 }) ? faker.helpers.arrayElement(users).id : null,
        approvedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent() : null,
      },
    });
    stockTransfers.push(transfer);
  }

  // Generate and save credentials file
  await generateCredentialsFile(TEST_USERS);

  console.log('✅ Enhanced database seeding completed!');
  console.log(`
📊 Created:
- 1 Organization (StockFlow Retail Enterprise)
- 3 Roles (Admin, Store Manager, Cashier)
- ${users.length} Users (${TEST_USERS.length} predefined + 35 Faker generated)
- ${locations.length} Locations
- ${categories.length} Categories
- ${brands.length} Brands
- ${units.length} Units
- ${taxRates.length} Tax Rates
- ${items.length} Items
- ${suppliers.length} Suppliers
- ${customers.length} Customers
- ${items.length * 5} Inventory Levels
- ${purchaseOrders.length} Purchase Orders
- ${salesOrders.length} Sales Orders
- ${stockAdjustments.length} Stock Adjustments
- ${stockTransfers.length} Stock Transfers

🔐 Test Credentials:
- Check TEST_CREDENTIALS.md for all login details
- Quick access: admin@stockflow.com / admin123
- All Faker users: password is "faker123"
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });