import './express';
import { categories, products, orders, orderItems } from './schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export * from './schema';

// --- Categories ---
export type Category = InferSelectModel<typeof categories>;
export type CreateCategoryDTO = InferInsertModel<typeof categories>;
export type UpdateCategoryDTO = Partial<CreateCategoryDTO> & { id: string };

// --- Products ---
export type Product = InferSelectModel<typeof products>;
export type CreateProductDTO = InferInsertModel<typeof products>;
export type UpdateProductDTO = Partial<CreateProductDTO>;

// --- Orders ---
export type Order = InferSelectModel<typeof orders>;
export type CreateOrderDTO = InferInsertModel<typeof orders>;
export type UpdateOrderDTO = Partial<CreateOrderDTO>;

// --- Order Items ---
export type OrderItem = InferSelectModel<typeof orderItems>;
export type CreateOrderItemDTO = InferInsertModel<typeof orderItems>;

// --- Re-exports (Legacy/Manual Interfaces) ---
// We keep these for now to avoid breaking changes, but we should eventually migrate to inferred types
// or make them extend the inferred types.
export * from './interfaces/category.interface';
export * from './interfaces/product.interface';
export * from './interfaces/order.interface';
export * from './interfaces/auth.interface';
export * from './interfaces/asaas.interface';
export * from './interfaces/cart.interface';
export * from './interfaces/routes.interface';
export * from './interfaces/apiError.interface';
