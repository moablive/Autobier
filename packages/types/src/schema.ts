import { pgTable, text, timestamp, uuid, real, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Categories ---
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// --- Products ---
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  purchase_price: real('purchase_price').notNull(),
  sale_price: real('sale_price').notNull(),
  image_base64: text('image_base64'),
  category_id: uuid('category_id').references(() => categories.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

// --- Orders ---
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_cpf: text('customer_cpf').notNull(),
  total_value: real('total_value').notNull(),
  // Asaas Data
  asaas_payment_id: text('asaas_payment_id').unique(),
  qr_code_base64: text('qr_code_base64'),
  copy_paste_code: text('copy_paste_code'),
  status: text('status').default('PENDING').notNull(),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

// --- Order Items ---
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));
