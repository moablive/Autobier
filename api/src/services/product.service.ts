import { db } from '@autobier/db';
import { products, categories } from '@autobier/types';
import { eq } from 'drizzle-orm';
import { ICreateProductDTO, IUpdateProductDTO } from '@autobier/types';

export class ProductService {
  
  // ==========================================================
  // ÁREA PÚBLICA (USER)
  // ==========================================================
  
  // Listagem de produtos
  async list() {
      const result = await db.query.products.findMany({
          orderBy: (products, { desc }) => [desc(products.created_at)],
          with: {
              category: {
                  columns: { name: true }
              }
          }
      });
      return result;
  }

  // ==========================================================
  // ÁREA ADMINISTRATIVA (ADM)
  // ==========================================================

  // Criação de produto
  async createProduct(data: ICreateProductDTO) {
    
    // 1. Validação obrigatória da categoria na criação
    const categoryExists = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, data.category_id)
    });

    if (!categoryExists) {
      throw new Error("Categoria informada não existe.");
    }

    // 2. Validação simples de formato de imagem
    if (data.image_base64 && !data.image_base64.startsWith('data:image')) {
       console.warn("Aviso: A string enviada não possui prefixo padrão de imagem (data:image...)");
    }

    // 3. Criação
    const [product] = await db.insert(products).values({
        name: data.name,
        description: data.description,
        purchase_price: data.purchase_price,
        sale_price: data.sale_price,
        image_base64: data.image_base64,
        category_id: data.category_id
    }).returning();

    return product;
  }
  
  // Edição de Produto
  async updateProduct(data: IUpdateProductDTO) {
    
    // 1. Verifica se o produto existe
    const productExists = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, data.id)
    });

    if (!productExists) {
      throw new Error("Produto não encontrado.");
    }

    // 2. Verifica se a categoria existe APENAS SE ela foi enviada para alteração
    if (data.category_id) {
        const categoryExists = await db.query.categories.findFirst({
          where: (categories, { eq }) => eq(categories.id, data.category_id)
        });

        if (!categoryExists) {
          throw new Error("Categoria informada não existe.");
        }
    }

    // 3. Atualiza no banco
    // Removemos chaves undefined do objeto data para não sobrescrever com null/undefined
    const updateData: any = { ...data };
    delete updateData.id; // Não atualiza o ID
    
    // Remove keys with undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    updateData.updated_at = new Date(); // Update timestamp

    const [productUpdated] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, data.id))
      .returning();

    return productUpdated;
  }

  // Exclusão de Produto
  async deleteProduct(id: string) {
    // 1. Verifica se o produto existe
    const productExists = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id)
    });

    if (!productExists) {
      throw new Error("Produto não encontrado.");
    }

    // 2. Deleta do banco
    await db.delete(products).where(eq(products.id, id));
    
    return true;
  }
}