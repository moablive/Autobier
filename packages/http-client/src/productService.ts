import api from './api';
import type { IProduct, ICreateProductDTO } from '@autobier/types';
import type { ICategory } from '@autobier/types';

export const productService = {

  // 1. Busca todos os produtos (Usado na tela de Listagem)
  async getAllProducts(): Promise<IProduct[]> {
    const { data } = await api.get<IProduct[]>('/products');
    return data;
  },

  // 2. Busca categorias (Usado no Select do formulário de criação/edição)
  async getAllCategories(): Promise<ICategory[]> {
    const { data } = await api.get<ICategory[]>('/categories');
    return data;
  },

  // 3. Cria um novo produto (Usado na tela AddProduct)
  async createProduct(data: ICreateProductDTO): Promise<IProduct> {
    const response = await api.post<IProduct>('/products', data);
    return response.data;
  },

  // 4. Atualiza um produto existente (Usado na Modal de Edição)
  // Utilizamos o mesmo DTO de criação, pois os campos são os mesmos
  async updateProduct(id: string, data: ICreateProductDTO): Promise<IProduct> {
    const response = await api.put<IProduct>(`/products/${id}`, data);
    return response.data;
  },

  // 5. Deleta um produto (Usado na tela de Listagem)
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};