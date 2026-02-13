import { db } from '@autobier/db';
import { categories, products } from '@autobier/types';
import { eq } from 'drizzle-orm';
import { IUpdateCategory, ICreateCategoryDTO  } from '@autobier/types';

export class CategoryService {
  
  // ==========================================================
  // ÁREA PÚBLICA (USADA NO CARDÁPIO)
  // ==========================================================

  // --- LISTAR ---
  async list() {
    const result = await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
        description: true
      },
      orderBy: (categories, { asc }) => [asc(categories.name)]
    });
    return result;
  }

  // ==========================================================
  // ÁREA ADMINISTRATIVA
  // ==========================================================

  // --- CRIAR ---
  async create({ name, description }: ICreateCategoryDTO) {
    
    if (!name) {
      throw new Error("Nome da categoria é obrigatório.");
    }

    const categoryAlreadyExists = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.name, name)
    });

    if (categoryAlreadyExists) {
      throw new Error("Categoria já existe.");
    }

    const [category] = await db.insert(categories).values({
      name,
      description
    }).returning();

    return category;
  }

  // --- ATUALIZAR ---
  async update({ id, name, description }: IUpdateCategory) {
    // 1. Verifica se a categoria existe
    const categoryExists = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, id)
    });

    if (!categoryExists) {
      throw new Error("Categoria não encontrada.");
    }

    // 2. Validação simples para não deixar salvar nome vazio
    if (name === "") {
        throw new Error("O nome da categoria não pode ficar vazio.");
    }

    // 3. Atualiza os dados
    const [category] = await db.update(categories)
      .set({
        name,
        description,
        updated_at: new Date() // Explicitly update updated_at if needed, though schema handles it via $onUpdate usually, but good to be safe if driver doesn't support $onUpdate fully or logic differs
      })
      .where(eq(categories.id, id))
      .returning();

    return category;
  }

  // --- EXCLUIR ---
  async delete(id: string) {
    // 1. Verifica se a categoria existe
    const categoryExists = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, id)
    });

    if (!categoryExists) {
      throw new Error("Categoria não encontrada.");
    }

    // 2. SEGURANÇA: Verifica se existem produtos vinculados a esta categoria
    // Isso impede que produtos fiquem "órfãos" no banco
    const productUsing = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.category_id, id)
    });

    if (productUsing) {
      throw new Error("Não é possível excluir: existem produtos cadastrados nesta categoria.");
    }

    // 3. Se estiver livre, deleta
    await db.delete(categories)
      .where(eq(categories.id, id));

    return true;
  }
}