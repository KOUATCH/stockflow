
export interface BriefTaxRateData {
  data: BriefTaxRateDTO[];
  pagination: Pagination;
}

export interface Pagination {
  // TaxRates: BriefTaxRateDTO[];
  totalCount: number;
  page: number;
  limit: number;
  pages: number;
}


export interface PaginatedResponse<T> {
  pagination: Pagination;
  data: T[];

}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | null | undefined;
}

// export type BriefTaxRateResponse= ApiResponse<BriefTaxRateData[]>;
export type BriefTaxRateResponse = ApiResponse<BriefTaxRatePayload[]>;
export type TaxRateResponse = ApiResponse<TaxRatePayload[]>;
export type CompleteTaxRateResponse = ApiResponse<TaxRateDTO[]>;

export type TaxRateCreateDTO = {
  id: string;
  createdAt: Date | string;
  taxRateName: string;
  rate: number;
  organizationId: string;
}
// types/TaxRate.ts
export interface TaxRate {
  id: string;
  createdAt: Date | string;
  taxRateName: string;
  rate: number;
  organizationId: string;
}

export type TaxRatePayload = {
  id: string;
  createdAt: Date | string;
  taxRateName: string;
  rate: number;
  organizationId: string;
};

export type UpdateTaxRatePayload = {
  id: string;
  createdAt: Date | string;
  taxRateName: string;
  rate: number;
  organizationId: string |   null;
};


export type TaxRateDTO = {
  id: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  taxRateName: string;
  rate: number;
};

export type BriefTaxRateDTO = {
  id: string
  taxRateName: string;
  rate: number;
  createdAt: Date;
  organizationId: string;
};

export type BriefTaxRatePayload = {
  id: string
  taxRateName: string;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
};


// Mutation context and data types
export interface MutationContext<T> {
  previousTaxRateDetail?: T | undefined
  previousTaxRatesList?: T[] | undefined
}

export interface UpdateModelData<T> {
  id: string
  data: T
}