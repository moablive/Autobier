import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  
  // ==========================================================
  // ÁREA PÚBLICA (USER / VISITANTE)
  // ==========================================================
  
  // Listagem de Categorias
  async index(req: Request, res: Response): Promise<Response> {
    const categoryService = new CategoryService();
    
    try {
      const categories = await categoryService.list(); 
      return res.json(categories);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ==========================================================
  // ÁREA RESTRITA (ADMIN)
  // ==========================================================

  // CRIAR
  async store(req: Request, res: Response): Promise<Response> {
    // Adicionei 'description' aqui para bater com a atualização do Service
    const { name, description } = req.body; 
    const categoryService = new CategoryService();

    try {
      const category = await categoryService.create({ name, description });
      return res.status(201).json(category);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // EDITAR
  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // Pega o ID da URL
    const { name, description } = req.body; // Adicionei description aqui também
    
    const categoryService = new CategoryService();

    try {
      const category = await categoryService.update({ id: id as string, name, description });
      return res.json(category);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // EXCLUIR
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const categoryService = new CategoryService();

    try {
      await categoryService.delete(id as string);
      // Status 204: Sucesso, mas sem conteúdo para retornar
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}