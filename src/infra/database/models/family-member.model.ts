import * as p from 'drizzle-orm/pg-core';
import { UserModel } from './user.model';

export const FamilyMemberModel = p.pgTable('family_members', {
  id: p.uuid().primaryKey().defaultRandom(),
  userId: p.uuid('user_id').notNull().references(() => UserModel.id, { onDelete: 'cascade' }),
  name: p.varchar({ length: 255 }).notNull(),
  createdAt: p.timestamp('created_at').defaultNow(),
  updatedAt: p.timestamp('updated_at').defaultNow(),
}, (table) => [
  p.index('idx_family_members_user').on(table.userId),
]);
