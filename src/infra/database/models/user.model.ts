import * as p from "drizzle-orm/pg-core";

export const UserModel = p.pgTable("users", {
  id: p.uuid().primaryKey().defaultRandom(),
  name: p.varchar({ length: 255 }).notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  passwordHash: p.varchar("password_hash", { length: 255 }).notNull(),
  createdAt: p.timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: p.timestamp("updated_at", { mode: "date" }).defaultNow(),
});
