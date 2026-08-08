import { PrismaClient } from "@prisma/client";

// Global Prisma instance for Next.js in dev mode
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function getModel(collection: string) {
  switch (collection) {
    case "contacts": return prisma.contactMessage;
    case "quotes": return prisma.quoteRequest;
    case "projects": return prisma.project;
    case "services": return prisma.service;
    case "testimonials": return prisma.testimonial;
    case "newsletter": return prisma.newsletterSubscriber;
    case "stats": return prisma.stats;
    case "settings": return prisma.settings;
    case "hero": return prisma.heroSlide;
    case "team": return prisma.teamMember;
    case "applications": return prisma.jobApplication;
    case "jobs": return prisma.jobPosting;
    case "guarantees": return prisma.guarantee;
    default: throw new Error(`Unknown collection: ${collection}`);
  }
}

export async function readDB<T>(collection: string): Promise<T[]> {
  return await findAll<T>(collection);
}

export async function writeDB<T>(collection: string, data: T[]): Promise<void> {
  // Unused in typical prisma, just a stub
}

export async function insertOne<T>(collection: string, doc: any): Promise<T> {
  const model = getModel(collection) as any;
  return await model.create({ data: doc });
}

export async function findAll<T>(collection: string): Promise<T[]> {
  const model = getModel(collection) as any;
  return await model.findMany();
}

export async function findById<T>(collection: string, id: string): Promise<T | null> {
  const model = getModel(collection) as any;
  return await model.findUnique({ where: { id } });
}

export async function updateOne<T>(collection: string, id: string, updates: any): Promise<T | null> {
  const model = getModel(collection) as any;
  try {
    return await model.update({ where: { id }, data: updates });
  } catch {
    return null; // Prisma throws if record not found
  }
}

export async function deleteOne(collection: string, id: string): Promise<boolean> {
  const model = getModel(collection) as any;
  try {
    await model.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
