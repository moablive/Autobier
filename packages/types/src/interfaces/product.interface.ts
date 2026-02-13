import { ICategory } from './category.interface';

export interface IProduct {
  id: string;
  name: string;
  description?: string | null;
  purchase_price: number | string; // Aceita string vindo do input do front
  sale_price: number | string;     // Aceita string vindo do input do front
  image_base64?: string | null;
  category_id: string;
  category?: ICategory;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateProductDTO {
  name: string;
  description?: string;
  category_id: string;
  purchase_price: number;
  sale_price: number;
  image_base64: string;
}

export interface IUpdateProductDTO extends Partial<ICreateProductDTO> {
  id: string;
}