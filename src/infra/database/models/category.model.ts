import * as p from "drizzle-orm/pg-core";
import { UserModel } from "./user.model";

export const CategoryModel = p.pgTable("categories", {
  id: p.uuid().primaryKey().defaultRandom(),
  userId: p.uuid().notNull().references(() => UserModel.id, { onDelete: 'cascade' }),
  name: p.varchar({ length: 255 }).notNull(),
  icon: p.varchar({ length: 10 }).default('📋'),
  type: p.varchar({ length: 20, enum: ['income', 'expense'] }),
  createdAt: p.timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: p.index('idx_categories_user').on(table.userId),
}));
