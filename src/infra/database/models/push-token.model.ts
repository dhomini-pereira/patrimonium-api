import * as p from "drizzle-orm/pg-core";
import { UserModel } from "./user.model";

export const PushTokenModel = p.pgTable(
  "push_tokens",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    userId: p
      .uuid("user_id")
      .notNull()
      .references(() => UserModel.id, { onDelete: "cascade" }),
    token: p.text().notNull(),
    createdAt: p.timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: p.index("idx_push_tokens_user").on(table.userId),
    userTokenIdx: p.unique().on(table.userId, table.token),
  }),
);
