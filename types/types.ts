import { Role, User } from "@prisma/client";


export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
  organizationId: string;
};


export type OrganizationProps = {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  country?: string;
  state?: string;
  address?: string;
  currency?: string;
  timezone?: string;
  inventoryStartDate?: Date;
  fiscalYear?: string;
  
};

export type TaxRateProps = {
  taxRateName: string;
  rate: number;
  organizationId: string;
  createdAt: Date;
};

export type CategoryDTO = {
  id: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  description: string | undefined;
  title: string;
  slug: string;
  imageUrl: string | null;
};


export type RoleProps = {
  name: string;
  description?: string;
  permissions: string[];
  organizationId: string;

};
export type SavingProps = {
  amount: number;
  month: string;
  name: string;
  userId: string;
  paymentDate: any;
};
export type UserProps = {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  organizationName: string;
  password: string;
};
export type UnitProps = {
  name: string;
  symbol: string;
  organizationId: string;


};
export interface UnitResponse {
  name: string;
  symbol: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  id: string;

};

export type InvitedUserProps = {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  organizationId: string;
  roleId: string;
  password: string;
  organizationName: string;
};

export type OrgIDProps = {
  orgID: string
}


export type LoginProps = {
  email: string;
  password: string;
};
export type ForgotPasswordProps = {
  email: string;
};

// types/types.ts

export interface RoleFormData {
  name: string;
  description?: string;
  permissions: string[];
  organizationId: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface RoleOption {
  label: string;
  value: string;
}

export interface UpdateUserRoleResponse {
  error: string | null;
  status: number;
  data: UserWithRoles | null;
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
//   previousCategoryDetail?: Category;
//   previousCategorysList?: Category[];
// };