// app/lib/actions/customer-actions.ts
'use server';

import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schema for customer validation
const CustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  creditLimit: z.number().min(0).optional().nullable(),
  paymentTerms: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    creditLimit?: string[];
    paymentTerms?: string[];
  };
  message?: string | null;
};

export async function createCustomer(organizationId: string, formData: FormData, prevState?: CustomerState) {
  const validatedFields = CustomerSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    taxId: formData.get('taxId'),
    creditLimit: formData.get('creditLimit') ? Number(formData.get('creditLimit')) : null,
    paymentTerms: formData.get('paymentTerms') ? Number(formData.get('paymentTerms')) : null,
    notes: formData.get('notes'),
    isActive: formData.get('isActive') === 'true',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, code, email, phone, address, taxId, creditLimit, paymentTerms, notes, isActive } = validatedFields.data;

  try {
    // Check if customer code already exists in organization
    if (code) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          organizationId,
          code,
        },
      });

      if (existingCustomer) {
        return {
          message: 'Customer code already exists in this organization.',
        };
      }
    }

    // Create the customer
    await db.customer.create({
      data: {
        name,
        code,
        email,
        phone,
        address,
        taxId,
        creditLimit,
        paymentTerms,
        notes,
        isActive,
        organizationId,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(id: string, organizationId: string, prevState: CustomerState, formData: FormData) {
  const validatedFields = CustomerSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    taxId: formData.get('taxId'),
    creditLimit: formData.get('creditLimit') ? Number(formData.get('creditLimit')) : null,
    paymentTerms: formData.get('paymentTerms') ? Number(formData.get('paymentTerms')) : null,
    notes: formData.get('notes'),
    isActive: formData.get('isActive') === 'true',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, code, email, phone, address, taxId, creditLimit, paymentTerms, notes, isActive } = validatedFields.data;

  try {
    // Check if customer code already exists for another customer in the same organization
    if (code) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          organizationId,
          code,
          NOT: {
            id,
          },
        },
      });

      if (existingCustomer) {
        return {
          message: 'Customer code already exists for another customer in this organization.',
        };
      }
    }

    // Update the customer
    await db.customer.update({
      where: {
        id,
        organizationId,
      },
      data: {
        name,
        code,
        email,
        phone,
        address,
        taxId,
        creditLimit,
        paymentTerms,
        notes,
        isActive,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Update Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string, organizationId: string) {
  try {
    // Check if customer has any sales orders
    const salesOrders = await db.salesOrder.count({
      where: {
        customerId: id,
      },
    });

    if (salesOrders > 0) {
      return {
        message: 'Cannot delete customer with existing sales orders.',
      };
    }

    await db.customer.delete({
      where: {
        id,
        organizationId,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Delete Customer.',
    };
  }

  revalidatePath('/dashboard/customers');
}

export async function toggleCustomerStatus(id: string, organizationId: string, isActive: boolean) {
  try {
    await db.customer.update({
      where: {
        id,
        organizationId,
      },
      data: {
        isActive,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Update Customer Status.',
    };
  }

  revalidatePath('/dashboard/customers');
}

export async function getCustomerById(id: string, organizationId: string) {
  try {
    const customer = await db.customer.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        salesOrders: {
          include: {
            payments: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 10,
        },
      },
    });

    return customer;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}

export async function getCustomers(organizationId: string, query: string = '', page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    
    const whereClause = {
      organizationId,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { email: { contains: query, mode: 'insensitive' as const } },
          { phone: { contains: query, mode: 'insensitive' as const } },
          { code: { contains: query, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [customers, totalCount] = await Promise.all([
      db.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              salesOrders: true,
            },
          },
        },
      }),
      db.customer.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      customers,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}