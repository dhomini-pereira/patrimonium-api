import * as p from 'drizzle-orm/pg-core';
import { AccountModel } from './account.model';
import { UserModel } from './user.model';

export const SharedAccountModel = p.pgTable('shared_accounts', {
  id: p.uuid().primaryKey().defaultRandom(),
  ownerId: p.uuid('owner_id').notNull().references(() => UserModel.id, { onDelete: 'cascade' }),
  sharedWithUserId: p.uuid('shared_with_user_id').notNull().references(() => UserModel.id, { onDelete: 'cascade' }),
  accountId: p.uuid('account_id').notNull().references(() => AccountModel.id, { onDelete: 'cascade' }),
  createdAt: p.timestamp('created_at').defaultNow(),
}, (table) => [
  p.unique().on(table.sharedWithUserId, table.accountId),
  p.index('idx_shared_accounts_owner').on(table.ownerId),
  p.index('idx_shared_accounts_shared').on(table.sharedWithUserId),
]);
