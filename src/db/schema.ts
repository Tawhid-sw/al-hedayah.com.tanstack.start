import { pgTable, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const todoTable = pgTable("todos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  completed: boolean().default(false).notNull(),
});

export const insertTodoSchema = createInsertSchema(todoTable, {
  title: (schema) => schema.min(2).max(255),
});
export const selectTodoSchema = createSelectSchema(todoTable);
