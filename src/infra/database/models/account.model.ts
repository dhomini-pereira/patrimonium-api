import * as p from "drizzle-orm/pg-core";
import { UserModel } from "./user.model";

export const AccountModel = p.pgTable(
  "accounts",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    userId: p
      .uuid("user_id")
      .notNull()
      .references(() => UserModel.id, { onDelete: "cascade" }),
    name: p.varchar({ length: 255 }).notNull(),
    type: p.varchar({ enum: ["wallet", "checking", "digital", "investment"] }),
    balance: p
      .decimal({ mode: "string", precision: 2, scale: 15 })
      .default("0"),
    color: p.varchar({ length: 20 }).default("#2563eb"),
    createdAt: p.timestamp("created_at").defaultNow(),
    updatedAt: p.timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: p.index("idx_account_user").on(table.userId),
  }),
);
