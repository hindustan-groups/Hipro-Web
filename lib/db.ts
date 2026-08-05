/**
 * Simple JSON file-based database
 * Stores data in /data/*.json files
 * In production, replace with a real DB (MongoDB, PostgreSQL etc.)
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDB<T>(collection: string): T[] {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeDB<T>(collection: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function insertOne<T extends { id?: string; createdAt?: string }>(
  collection: string,
  doc: T
): T {
  const data = readDB<T>(collection);
  const newDoc: T = {
    ...doc,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  data.push(newDoc);
  writeDB(collection, data);
  return newDoc;
}

export function findAll<T>(collection: string): T[] {
  return readDB<T>(collection);
}

export function findById<T extends { id?: string }>(
  collection: string,
  id: string
): T | null {
  const data = readDB<T>(collection);
  return data.find((d) => d.id === id) ?? null;
}

export function updateOne<T extends { id?: string; updatedAt?: string }>(
  collection: string,
  id: string,
  updates: Partial<T>
): T | null {
  const data = readDB<T>(collection);
  const idx = data.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDB(collection, data);
  return data[idx];
}

export function deleteOne<T extends { id?: string }>(
  collection: string,
  id: string
): boolean {
  const data = readDB<T>(collection);
  const filtered = data.filter((d) => d.id !== id);
  if (filtered.length === data.length) return false;
  writeDB(collection, filtered);
  return true;
}
