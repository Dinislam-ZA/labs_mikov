"use server";

import { db } from "@/lib/db";

export async function getAllTables() {
  const tables = db
    .prepare(
      `
    SELECT name FROM sqlite_master
    WHERE type='table'
  `
    )
    .all();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [tableName: string]: any[] } = {};

  // @ts-expect-error fix later pls
  for (const { name } of tables) {
    const rows = db.prepare(`SELECT * FROM ${name}`).all();
    result[name] = rows;
  }

  return result;
}
