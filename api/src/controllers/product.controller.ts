import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {

  // ==========================================================
  // ÁREA PÚBLICA (USER / VISITANTE)
  // ==========================================================
  
  // Listagem de produtos
  async index(req: Request, res: Response): Promise<Response> {
      const productService = new ProductService();
      
      try {
        const products = await productService.list();
        return res.json(products);
      } catch (err: any) {
        // É sempre bom ter um try/catch mesmo na listagem
        return res.status(400).json({ error: err.message });
      }
  }

  // ==========================================================
  // ÁREA RESTRITA (ADMIN / OPERADOR)
  // ==========================================================

  // Criação de produto
  async store(req: Request, res: Response): Promise<Response> {
    const { 
      name, 
      description, 
      category_id, 
      purchase_price, 
      sale_price, 
      image_base64 
    } = req.body;

    const productService = new ProductService();

    try {
      // Dica: Se os preços vierem como string do frontend, garanta a conversão aqui ou no Service
      const product = await productService.createProduct({
        name,
        description,
        category_id,
        purchase_price: Number(purchase_price), // Garante que é número
        sale_price: Number(sale_price),         // Garante que é número
        image_base64
      });

      return res.status(201).json(product);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Edição de Produto
  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { 
      name, 
      description, 
      category_id, 
      purchase_price, 
      sale_price, 
      image_base64 
    } = req.body;

    const productService = new ProductService();

    try {
      const product = await productService.updateProduct({
        id: id as string,
        name,
        description,
        category_id,
        purchase_price: purchase_price ? Number(purchase_price) : undefined,
        sale_price: sale_price ? Number(sale_price) : undefined,
        image_base64
      });

      return res.json(product);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Exclusão de Produto
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const productService = new ProductService();

    try {
      await productService.deleteProduct(id as string);
      // Retorna 204 (No Content) quando deleta com sucesso
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}