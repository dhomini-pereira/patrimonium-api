import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { UserModel } from "./user.model";

export const CreditCardModel = p.pgTable(
  "credit_cards",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    userId: p
      .uuid("user_id")
      .references(() => UserModel.id, { onDelete: "cascade" })
      .notNull(),
    name: p.varchar({ length: 255 }).notNull(),
    cardLimit: p
      .decimal("card_limit", { mode: "string", precision: 2, scale: 15 })
      .notNull()
      .default("0"),
    closingDay: p.integer("closing_day").notNull(),
    dueDay: p.integer("due_day").notNull(),
    color: p.varchar({ length: 20 }).default("#8b5cf6"),
    createdAt: p.timestamp("created_at").defaultNow(),
    updatedAt: p.timestamp("updated_at").defaultNow(),
    bestPurchaseDay: p.integer("best_purchase_day").default(sql`NULL`),
  },
  (table) => [
    p.check("closing_day_check", sql`${table.closingDay} BETWEEN 1 AND 31`),
    p.check("due_day_check", sql`${table.dueDay} BETWEEN 1 AND 31`),
    p.index("idx_credit_cards_user").on(table.userId),
    p.check(
      "best_pucharse_day_check",
      sql`${table.bestPurchaseDay} BETWEEN 1 AND 31`,
    ),
  ],
);
