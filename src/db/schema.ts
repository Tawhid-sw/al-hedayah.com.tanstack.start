import { integer, pgTable, varchar, boolean } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const todoTable = pgTable("todo", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  isCompleted: boolean().default(false),
});

export const selectTodoSchema = createSelectSchema(todoTable);
