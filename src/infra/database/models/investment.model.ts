import * as p from 'drizzle-orm/pg-core';
import { UserModel } from './user.model';

export const InvestmentModel = p.pgTable('investments', {
  id: p.uuid().primaryKey().defaultRandom(),
  userId: p.uuid('user_id').notNull().references(() => UserModel.id, { onDelete: 'cascade' }),
  name: p.varchar({ length: 255 }).notNull(),
  type: p.varchar({ length: 100 }).notNull(),
  principal: p.decimal({ mode: 'string', precision: 2, scale: 15 }).notNull(),
  currentValue: p.decimal('current_value', { mode: 'string', precision: 2, scale: 15 }).notNull(),
  returnRate: p.decimal('return_rate', { mode: 'string', precision: 4, scale: 8 }).default('0'),
  startDate: p.date('start_date').notNull(),
  createdAt: p.timestamp('created_at').defaultNow(),
  updatedAt: p.timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: p.index('idx_investments_user').on(table.userId),
}));
