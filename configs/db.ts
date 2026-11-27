import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { BaseEnvironment } from "./BaseEnvironment";

const env = new BaseEnvironment();

const sql = neon(env.DRIZZLE_DATABASE_URL!);

// @neondatabase/serverless v1 only allows tagged-template or sql.query()
// calls. The drizzle-orm 0.33 neon-http driver still calls its client as
// sql(query, params, options), so adapt it onto the new sql.query() API.
const client = Object.assign(
  (query: string, params: unknown[], options?: Parameters<typeof sql.query>[2]) =>
    sql.query(query, params, options),
  {
    transaction: sql.transaction,
    unsafe: sql.unsafe,
  },
) as unknown as typeof sql;

export const db = drizzle(client);
