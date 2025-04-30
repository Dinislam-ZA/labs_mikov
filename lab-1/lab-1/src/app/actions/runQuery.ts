"use server";

import { db } from "@/lib/db";

export async function runQuery(query: string) {
  try {
    const rows = db.prepare(query).all();
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { rows, columns };
  } catch (error) {
    return { error: String(error) };
  }
}
