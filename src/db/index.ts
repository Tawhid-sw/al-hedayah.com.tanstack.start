import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const getDB = (db_Url: string) => {
  const sql = neon(db_Url);
  return drizzle({ client: sql });
};
