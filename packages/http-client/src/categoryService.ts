import api from './api';
import type { ICategory, ICreateCategoryDTO, IUpdateCategoryDTO } from '@autobier/types';

export const categoryService = {
  
  // Listar todas as categorias
  async getAll(): Promise<ICategory[]> {
    const { data } = await api.get<ICategory[]>('/categories');
    return data;
  },

  // Criar uma nova categoria
  async create(data: ICreateCategoryDTO): Promise<ICategory> {
    const { data: response } = await api.post<ICategory>('/categories', data);
    return response;
  },

  // Editar uma categoria existente
  async update(id: string, data: IUpdateCategoryDTO): Promise<ICategory> {
    const { data: response } = await api.put<ICategory>(`/categories/${id}`, data);
    return response;
  },

  // Excluir uma categoria
  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};