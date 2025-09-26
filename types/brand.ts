import { ApiResponse } from "./item";

  export interface BriefBrandData{
    data:BriefBrandDTO[];
   pagination: Pagination;
  }
  
  export interface Pagination{
    // Brands: BriefBrandDTO[];
    totalCount: number;
    page: number;
    limit: number;
    pages: number;
  }
 
  export interface PaginatedResponse<T> {
    pagination: Pagination;
    data: T[];
    
  }

 

  // export type BriefBrandResponse= ApiResponse<BriefBrandData[]>;
  export type BriefBrandResponse= ApiResponse<BriefBrandPayload[]>;
  export type BrandResponse= ApiResponse<BrandDTO[]>;

  export type BrandCreateDTO = {
    id: string;
    organizationId: string | null;
    createdAt: Date;
    // updatedAt: Date;
    slug: string;
    brandName: string;
  }
  // types/Brand.ts
export interface Brand {
  id: string;
  organizationId: string | null;
  createdAt: Date;
  slug: string;
  brandName: string;
    updatedAt: Date | string;
  }
  
export type     BrandPayload = {
  id: string;
  brandName: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
};

export type UpdateBrandPayload = {
  id: string;
  brandName: string;
  slug: string;

  createdAt: Date;
   organizationId: string;
};

export type BrandDTO = {

   id: string;
    organizationId: string | null;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    brandName: string;
};

export type BriefBrandDTO = {
  id: string;
  brandName: string;
  slug: string;
};

export type BriefBrandPayload = {
  id: string;
    organizationId: string | null;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    brandName: string;
};
