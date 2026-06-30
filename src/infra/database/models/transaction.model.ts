import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { AccountModel } from "./account.model";
import { CategoryModel } from "./category.model";
import { CreditCardModel } from "./credit-card.model";
import { FamilyMemberModel } from "./family-member.model";
import { UserModel } from "./user.model";

export const TransactionModel = p.pgTable(
  "transactions",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    userId: p
      .uuid("user_id")
      .notNull()
      .references(() => UserModel.id, { onDelete: "cascade" }),
    accountId: p
      .uuid("account_id")
      .references(() => AccountModel.id, { onDelete: "set null" }),
    categoryId: p
      .uuid("category_id")
      .references(() => CategoryModel.id, { onDelete: "set null" }),
    description: p.varchar({ length: 500 }).notNull(),
    amount: p.decimal({ mode: "string", precision: 2, scale: 15 }).notNull(),
    type: p.varchar({ length: 20, enum: ["income", "expense"] }).notNull(),
    date: p.date().notNull().defaultNow(),
    recurring: p.boolean().default(false),
    recurrence: p.varchar({
      length: 20,
      enum: ["daily", "weekly", "monthly", "yearly"],
    }),
    nextDueDate: p.date("next_due_date"),
    createdAt: p.timestamp("created_at").defaultNow(),
    recurrenceCount: p.integer("recurrence_count"),
    recurrenceCurrent: p.integer("recurrence_current").default(0),
    recurrenceGroupId: p.uuid("recurrence_group_id"),
    recurrencePaused: p.boolean("recurrence_paused").default(false),
    creditCardId: p
      .uuid("credit_card_id")
      .references(() => CreditCardModel.id, { onDelete: "set null" }),
    installment: p.integer(),
    installmentCurrent: p.integer("installmentCurrent"),
    familyMemberId: p
      .uuid("family_member_id")
      .references(() => FamilyMemberModel.id, { onDelete: "set null" }),
  },
  (table) => [
    p.index("idx_transactions_user").on(table.userId),
    p.index("idx_transactions_date").on(table.date),
    p.index("idx_transactions_account").on(table.accountId),
    p
      .index("idx_transactions_recurring")
      .on(table.recurring, table.nextDueDate)
      .where(sql`recurring = true`),
    p.index("idx_transactions_date_only").on(table.date),
    p
      .index("idx_transactions_group")
      .on(table.recurrenceGroupId)
      .where(sql`recurrence_group_id IS NOT NULL`),
    p
      .index("idx_transactions_credit_card")
      .on(table.creditCardId)
      .where(sql`credit_card_id IS NOT NULL`),
  ],
);
