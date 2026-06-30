import * as p from "drizzle-orm/pg-core";
import { UserModel } from "./user.model";

export const RefreshTokenModel = p.pgTable(
  "refresh_tokens",
  {
    id: p.uuid().primaryKey().defaultRandom(),
    userId: p
      .uuid("user_id")
      .notNull()
      .references(() => UserModel.id, { onUpdate: "cascade" }),
    token: p.text().notNull().unique(),
    expiresAt: p.timestamp("expires_at").notNull(),
    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: p.index("idx_refresh_tokens_user").on(table.userId),
    tokenIdx: p.index("idx_refresh_tokens_token").on(table.token),
  }),
);
