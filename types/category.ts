// import { ApiResponse } from "./item";

import { ApiResponse } from "./itemTypes";

  export interface BriefCategoryData{
    data:BriefCategoryDTO[];
   pagination: Pagination;
  }
  
  export interface Pagination{
    // Categorys: BriefCategoryDTO[];
    totalCount: number;
    page: number;
    limit: number;
    pages: number;
  }
 
  export interface PaginatedResponse<T> {
    pagination: Pagination;
    data: T[];
    
  }

 

  // export type BriefCategoryResponse= ApiResponse<BriefCategoryData[]>;
  export type BriefCategoryResponse= ApiResponse<BriefCategoryPayload[]>;
  export type CategoryResponse= ApiResponse<CategoryDTO[]>;
    // export type CompleteItemResponse= ApiResponse<ItemDTO[]>;
  

  export type CategoryCreateDTO = {
    id: string;
    organizationId: string;
    createdAt: Date;
    slug: string;
    description: string;
    title: string;
  }
  // types/Category.ts
export interface Category {
  id: string;
  organizationId: string | null;
  createdAt: Date;
  slug: string;
  title: string;
    updatedAt: Date | string;
  }
  
export type     CategoryPayload = {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
};

export type UpdateCategoryPayload = {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
   organizationId: string;
  imageUrl: string | null;
  description?: string | null;
};

export type CategoryDTO = {
  id: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | undefined;
  title: string;
  slug: string;
  imageUrl: string | null;
};

export type BriefCategoryDTO = {
  id: string;
  title: string;
  slug: string;
};

export type BriefCategoryPayload = {
  id: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  title: string;
  slug: string;
  imageUrl: string | null;
};
