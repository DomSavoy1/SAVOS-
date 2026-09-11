import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const operatingState = sqliteTable("operating_state", {
  id: text("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull(),
});
