import * as p from "drizzle-orm/pg-core";
import { AccountModel } from "./account.model";
import { CreditCardModel } from "./credit-card.model";
import { UserModel } from "./user.model";

export const CreditCardInvoiceModel = p.pgTable(
  "credit_card_invoices",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    creditCardId: p
      .uuid("credit_card_id")
      .references(() => CreditCardModel.id, { onDelete: "cascade" })
      .notNull(),
    userId: p
      .uuid("user_id")
      .references(() => UserModel.id, { onDelete: "cascade" })
      .notNull(),
    referenceMonth: p.varchar({ length: 7 }).notNull(), //YYYY-MM
    total: p.decimal({ mode: "string", precision: 2, scale: 15 }).default("0"),
    paid: p.boolean().default(false),
    paidAt: p.timestamp("paid_at"),
    paidAmount: p
      .decimal("paid_amount", { mode: "string", precision: 2, scale: 15 })
      .default("0"),
    paidWithAccountId: p
      .uuid("paid_with_account_id")
      .references(() => AccountModel.id, { onDelete: "set null" }),
    createdAt: p.timestamp("created_at").defaultNow(),
  },
  (table) => [
    p.unique().on(table.creditCardId, table.referenceMonth),
    p.index("idx_invoices_card").on(table.creditCardId),
    p.index("idx_invoices_user").on(table.userId),
  ],
);
