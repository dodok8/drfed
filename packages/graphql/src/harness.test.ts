// DrFed: A web-based platform for developing and debugging ActivityPub apps
// Copyright (C) 2026 DrFed team
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
import { type Database, migrate, relations, schema } from "@drfed/models";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

/**
 * Runs a callback with a fresh in-memory PGlite database.
 *
 * The database is migrated before the callback is invoked, so every table in
 * the current `@drfed/models` schema is available.  The underlying PGlite
 * client is closed after the callback resolves or rejects.
 *
 * @example
 * ```ts
 * import assert from "node:assert/strict";
 * import { it } from "node:test";
 *
 * import { schema } from "@drfed/models";
 *
 * import { withTemporaryDatabase } from "./harness.test.ts";
 *
 * it("queries accounts", async () => {
 *   await withTemporaryDatabase(async (db) => {
 *     const accounts = await db.select().from(schema.accounts);
 *     assert.deepEqual(accounts, []);
 *   });
 * });
 * ```
 *
 * @param callback A function that receives the migrated database.
 * @returns The callback's resolved value.
 */
export async function withTemporaryDatabase<T>(
  // oxlint-disable-next-line promise/prefer-await-to-callbacks
  callback: (db: Database) => Promise<T> | T,
): Promise<Awaited<T>> {
  const client = new PGlite();
  try {
    await client.waitReady;
    await migrate({ credentials: { driver: "pglite", client } });
    const db: Database = drizzle({ client, relations, schema });
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    return await callback(db);
  } finally {
    await client.close();
  }
}
