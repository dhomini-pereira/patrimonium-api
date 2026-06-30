import * as p from "drizzle-orm/pg-core";
import { UserModel } from "./user.model";

export const GoalModel = p.pgTable(
  "goals",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    userId: p
      .uuid()
      .notNull()
      .references(() => UserModel.id, { onDelete: "cascade" }),
    name: p.varchar({ length: 255 }).notNull(),
    targetAmount: p
      .decimal("target_amount", { mode: "string", precision: 2, scale: 15 })
      .notNull(),
    currentAmount: p
      .decimal("current_amount", { mode: "string", precision: 2, scale: 15 })
      .default("0"),
    deadline: p.date(),
    icon: p.varchar({ length: 10 }).default("🎯"),
    createdAt: p.timestamp("created_at").defaultNow(),
    updatedAt: p.timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: p.index("idx_goals_user").on(table.userId),
  }),
);
