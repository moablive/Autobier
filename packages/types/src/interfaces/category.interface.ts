export interface ICategory {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateCategoryDTO {
  name: string;
  description?: string;
}

export type IUpdateCategoryDTO = Partial<ICreateCategoryDTO>;

export interface IUpdateCategory {
  id: string;
  name: string;
  description?: string;
}
