import { pgTable, integer, varchar, boolean } from "drizzle-orm/pg-core";

export const todoTable = pgTable("todos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  completed: boolean().notNull().default(false),
});
