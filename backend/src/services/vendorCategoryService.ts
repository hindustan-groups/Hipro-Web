/**
 * vendorCategoryService.ts — Phase 2C.4
 *
 * Core service layer for Vendor Category & Subcategory operations:
 * - Public category retrieval with active-only filtering and in-memory TTL caching.
 * - Admin category retrieval with active/inactive inclusion and safe assignment counts.
 * - Admin creation and modification with strict validation and conflict prevention.
 * - Admin subcategory creation and modification with parent validation and immutable parent constraints.
 * - Immediate cache invalidation on successful mutations.
 */

import { PrismaClient } from "@prisma/client";
import { CANONICAL_VENDOR_CATEGORIES } from "../lib/vendorCategories";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ICON_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CacheEntry {
  data: any;
  expiresAt: number;
}

let publicCategoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60-second TTL

/**
 * In-memory cache operations
 */
export function getCachedPublicCategories(): any | null {
  if (publicCategoryCache && publicCategoryCache.expiresAt > Date.now()) {
    return publicCategoryCache.data;
  }
  return null;
}

export function setCachedPublicCategories(data: any): void {
  publicCategoryCache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function invalidatePublicCategoryCache(): void {
  publicCategoryCache = null;
}

/**
 * Public Categories Query
 * Returns only active categories and nested active subcategories.
 * Internal timestamps, counts, and admin metadata are excluded.
 */
export async function getPublicCategories(prisma: PrismaClient | any) {
  const cached = getCachedPublicCategories();
  if (cached) {
    return cached;
  }

  try {
    const categories = await prisma.vendorCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        nameHindi: true,
        description: true,
        icon: true,
        sortOrder: true,
        subcategories: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            categoryId: true,
            slug: true,
            name: true,
            nameHindi: true,
            description: true,
            sortOrder: true,
          },
        },
      },
    });

    setCachedPublicCategories(categories);
    return categories;
  } catch (_e) {
    // Resilient fallback for preview/local mode before DB migrations are run
    const fallback = CANONICAL_VENDOR_CATEGORIES.map((cat, idx) => ({
      id: `cat-${cat.slug}`,
      slug: cat.slug,
      name: cat.name,
      nameHindi: cat.nameHindi || null,
      description: cat.description || null,
      icon: cat.icon || null,
      sortOrder: idx + 1,
      subcategories: (cat.subcategories || []).map((sub, sIdx) => ({
        id: `sub-${sub.slug}`,
        categoryId: `cat-${cat.slug}`,
        slug: sub.slug,
        name: sub.name,
        nameHindi: sub.nameHindi || null,
        description: sub.description || null,
        sortOrder: sIdx + 1,
      })),
    }));
    setCachedPublicCategories(fallback);
    return fallback;
  }
}

/**
 * Admin Categories Query
 * Returns all categories (active & inactive) with all nested subcategories and safe assignment counts.
 */
export async function getAdminCategories(prisma: PrismaClient | any) {
  try {
    return await prisma.vendorCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        nameHindi: true,
        description: true,
        icon: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        subcategories: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            categoryId: true,
            slug: true,
            name: true,
            nameHindi: true,
            description: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            subcategories: true,
            applications: true,
            tenders: true,
          },
        },
      },
    });
  } catch (_e) {
    return CANONICAL_VENDOR_CATEGORIES.map((cat, idx) => ({
      id: `cat-${cat.slug}`,
      slug: cat.slug,
      name: cat.name,
      nameHindi: cat.nameHindi || null,
      description: cat.description || null,
      icon: cat.icon || null,
      sortOrder: idx + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: (cat.subcategories || []).map((sub, sIdx) => ({
        id: `sub-${sub.slug}`,
        categoryId: `cat-${cat.slug}`,
        slug: sub.slug,
        name: sub.name,
        nameHindi: sub.nameHindi || null,
        description: sub.description || null,
        sortOrder: sIdx + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      _count: {
        subcategories: (cat.subcategories || []).length,
        applications: 0,
        tenders: 0,
      },
    }));
  }
}

/**
 * Admin Create Category
 */
export async function createAdminCategory(
  prisma: PrismaClient | any,
  input: {
    slug: string;
    name: string;
    nameHindi?: string | null;
    description?: string | null;
    icon?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  const slug = (input.slug || "").trim().toLowerCase();
  const name = (input.name || "").trim();
  const nameHindi = input.nameHindi ? input.nameHindi.trim() : null;
  const description = input.description ? input.description.trim() : null;
  const icon = input.icon ? input.icon.trim().toLowerCase() : null;
  const sortOrder = typeof input.sortOrder === "number" && !isNaN(input.sortOrder) ? Math.max(0, Math.floor(input.sortOrder)) : 0;
  const isActive = typeof input.isActive === "boolean" ? input.isActive : true;

  if (!slug || !SLUG_REGEX.test(slug) || slug.length < 2 || slug.length > 80) {
    throw { status: 400, message: "Category slug must be a valid kebab-case string between 2 and 80 characters" };
  }

  if (!name || name.length < 2 || name.length > 100) {
    throw { status: 400, message: "Category name is required and must be between 2 and 100 characters" };
  }

  if (icon && !ICON_REGEX.test(icon)) {
    throw { status: 400, message: "Category icon must be a valid kebab-case identifier (e.g. 'hard-hat', 'zap')" };
  }

  // Conflict check: slug uniqueness
  const existingSlug = await prisma.vendorCategory.findUnique({
    where: { slug },
  });
  if (existingSlug) {
    throw { status: 409, message: `Category slug '${slug}' already exists` };
  }

  // Conflict check: name uniqueness (case-insensitive)
  const existingName = await prisma.vendorCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existingName) {
    throw { status: 409, message: `Category name '${name}' already exists` };
  }

  const created = await prisma.vendorCategory.create({
    data: {
      slug,
      name,
      nameHindi,
      description,
      icon,
      sortOrder,
      isActive,
    },
  });

  // Invalidate public cache
  invalidatePublicCategoryCache();
  return created;
}

/**
 * Admin Update Category
 */
export async function updateAdminCategory(
  prisma: PrismaClient | any,
  id: string,
  input: {
    id?: string;
    slug?: string;
    name?: string;
    nameHindi?: string | null;
    description?: string | null;
    icon?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  if (!id || typeof id !== "string") {
    throw { status: 400, message: "Category ID is required" };
  }

  const existing = await prisma.vendorCategory.findUnique({
    where: { id },
  });
  if (!existing) {
    throw { status: 404, message: "Category not found" };
  }

  // Immutable field guards
  if (input.id && input.id !== id) {
    throw { status: 400, message: "Category ID cannot be modified" };
  }
  if (input.slug && input.slug !== existing.slug) {
    throw { status: 400, message: "Category slug cannot be modified" };
  }

  const dataToUpdate: any = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name || name.length < 2 || name.length > 100) {
      throw { status: 400, message: "Category name must be between 2 and 100 characters" };
    }
    // Check name conflict against other categories
    const nameConflict = await prisma.vendorCategory.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: id },
      },
    });
    if (nameConflict) {
      throw { status: 409, message: `Category name '${name}' is already in use by another category` };
    }
    dataToUpdate.name = name;
  }

  if (input.nameHindi !== undefined) {
    dataToUpdate.nameHindi = input.nameHindi ? input.nameHindi.trim() : null;
  }

  if (input.description !== undefined) {
    dataToUpdate.description = input.description ? input.description.trim() : null;
  }

  if (input.icon !== undefined) {
    const icon = input.icon ? input.icon.trim().toLowerCase() : null;
    if (icon && !ICON_REGEX.test(icon)) {
      throw { status: 400, message: "Category icon must be a valid kebab-case identifier" };
    }
    dataToUpdate.icon = icon;
  }

  if (input.sortOrder !== undefined) {
    if (typeof input.sortOrder !== "number" || isNaN(input.sortOrder) || input.sortOrder < 0) {
      throw { status: 400, message: "sortOrder must be a non-negative integer" };
    }
    dataToUpdate.sortOrder = Math.floor(input.sortOrder);
  }

  if (input.isActive !== undefined) {
    if (typeof input.isActive !== "boolean") {
      throw { status: 400, message: "isActive must be a boolean" };
    }
    dataToUpdate.isActive = input.isActive;
  }

  const updated = await prisma.vendorCategory.update({
    where: { id },
    data: dataToUpdate,
  });

  // Invalidate public cache
  invalidatePublicCategoryCache();
  return updated;
}

/**
 * Admin Create Subcategory under Category
 */
export async function createAdminSubcategory(
  prisma: PrismaClient | any,
  categoryId: string,
  input: {
    slug: string;
    name: string;
    nameHindi?: string | null;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  if (!categoryId || typeof categoryId !== "string") {
    throw { status: 400, message: "Parent category ID is required" };
  }

  const parent = await prisma.vendorCategory.findUnique({
    where: { id: categoryId },
  });
  if (!parent) {
    throw { status: 404, message: "Parent category not found" };
  }

  const slug = (input.slug || "").trim().toLowerCase();
  const name = (input.name || "").trim();
  const nameHindi = input.nameHindi ? input.nameHindi.trim() : null;
  const description = input.description ? input.description.trim() : null;
  const sortOrder = typeof input.sortOrder === "number" && !isNaN(input.sortOrder) ? Math.max(0, Math.floor(input.sortOrder)) : 0;
  const isActive = typeof input.isActive === "boolean" ? input.isActive : true;

  if (!slug || !SLUG_REGEX.test(slug) || slug.length < 2 || slug.length > 80) {
    throw { status: 400, message: "Subcategory slug must be a valid kebab-case string between 2 and 80 characters" };
  }

  if (!name || name.length < 2 || name.length > 100) {
    throw { status: 400, message: "Subcategory name is required and must be between 2 and 100 characters" };
  }

  // Conflict check: [categoryId, slug] compound uniqueness
  const existingSub = await prisma.vendorSubcategory.findUnique({
    where: {
      categoryId_slug: {
        categoryId,
        slug,
      },
    },
  });
  if (existingSub) {
    throw { status: 409, message: `Subcategory slug '${slug}' already exists under category '${parent.name}'` };
  }

  const created = await prisma.vendorSubcategory.create({
    data: {
      categoryId,
      slug,
      name,
      nameHindi,
      description,
      sortOrder,
      isActive,
    },
  });

  // Invalidate public cache
  invalidatePublicCategoryCache();
  return created;
}

/**
 * Admin Update Subcategory
 */
export async function updateAdminSubcategory(
  prisma: PrismaClient | any,
  id: string,
  input: {
    id?: string;
    slug?: string;
    categoryId?: string;
    name?: string;
    nameHindi?: string | null;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  if (!id || typeof id !== "string") {
    throw { status: 400, message: "Subcategory ID is required" };
  }

  const existing = await prisma.vendorSubcategory.findUnique({
    where: { id },
  });
  if (!existing) {
    throw { status: 404, message: "Subcategory not found" };
  }

  // Immutable field guards
  if (input.id && input.id !== id) {
    throw { status: 400, message: "Subcategory ID cannot be modified" };
  }
  if (input.slug && input.slug !== existing.slug) {
    throw { status: 400, message: "Subcategory slug cannot be modified" };
  }
  if (input.categoryId && input.categoryId !== existing.categoryId) {
    throw {
      status: 400,
      message: "Parent category movement is not supported. Subcategory parent is immutable.",
    };
  }

  const dataToUpdate: any = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name || name.length < 2 || name.length > 100) {
      throw { status: 400, message: "Subcategory name must be between 2 and 100 characters" };
    }
    dataToUpdate.name = name;
  }

  if (input.nameHindi !== undefined) {
    dataToUpdate.nameHindi = input.nameHindi ? input.nameHindi.trim() : null;
  }

  if (input.description !== undefined) {
    dataToUpdate.description = input.description ? input.description.trim() : null;
  }

  if (input.sortOrder !== undefined) {
    if (typeof input.sortOrder !== "number" || isNaN(input.sortOrder) || input.sortOrder < 0) {
      throw { status: 400, message: "sortOrder must be a non-negative integer" };
    }
    dataToUpdate.sortOrder = Math.floor(input.sortOrder);
  }

  if (input.isActive !== undefined) {
    if (typeof input.isActive !== "boolean") {
      throw { status: 400, message: "isActive must be a boolean" };
    }
    dataToUpdate.isActive = input.isActive;
  }

  const updated = await prisma.vendorSubcategory.update({
    where: { id },
    data: dataToUpdate,
  });

  // Invalidate public cache
  invalidatePublicCategoryCache();
  return updated;
}

export interface TradeCategoryResolution {
  category: string | null;
  categoryId: string | null;
  record: any | null;
}

/**
 * Resolves category for dual-write operations in Registration, Review, and Tenders.
 *
 * Rules:
 * - If both omitted and not required -> { category: null, categoryId: null, record: null }
 * - If categoryId provided: resolves from DB or canonical, verifies isActive (rejects inactive with 400).
 * - If category name provided: resolves from DB or canonical, verifies isActive (rejects inactive with 400).
 * - If both provided: verifies they match. Mismatch throws 400.
 * - Non-existent or unapproved categories throw 400.
 */
export async function resolveTradeCategory(
  prisma: PrismaClient | any,
  input: {
    categoryId?: string | null;
    category?: string | null;
  },
  options: { isRequired?: boolean } = {}
): Promise<TradeCategoryResolution> {
  const rawId = input.categoryId && typeof input.categoryId === "string" ? input.categoryId.trim() : null;
  const rawName = input.category && typeof input.category === "string" ? input.category.trim() : null;

  // Case 1: Both omitted / empty
  if (!rawId && !rawName) {
    if (options.isRequired) {
      throw { status: 400, message: "Trade category is required" };
    }
    return { category: null, categoryId: null, record: null };
  }

  let dbRecord: any = null;

  // Case 2: rawId provided
  if (rawId) {
    try {
      dbRecord = await prisma.vendorCategory.findFirst({
        where: {
          OR: [{ id: rawId }, { slug: rawId.toLowerCase() }],
        },
      });
    } catch {
      // Offline / mock fallback
    }

    if (!dbRecord) {
      const canonical = CANONICAL_VENDOR_CATEGORIES.find(
        (c) => c.slug === rawId.toLowerCase() || `cat-${c.slug}` === rawId || c.name.toLowerCase() === rawId.toLowerCase()
      );
      if (canonical) {
        dbRecord = {
          id: `cat-${canonical.slug}`,
          slug: canonical.slug,
          name: canonical.name,
          isActive: true,
        };
      }
    }

    if (!dbRecord) {
      throw { status: 400, message: `Invalid trade category '${rawId}': category not found` };
    }

    if (!dbRecord.isActive) {
      throw { status: 400, message: `Trade category '${dbRecord.name}' is inactive and cannot be selected` };
    }

    // Verify consistency if rawName was also provided
    if (rawName) {
      const matchName = rawName.toLowerCase();
      if (matchName !== dbRecord.name.toLowerCase() && matchName !== dbRecord.slug.toLowerCase()) {
        throw {
          status: 400,
          message: `Category ID and category name mismatch: '${rawId}' does not match '${rawName}'`,
        };
      }
    }

    return { category: dbRecord.name, categoryId: dbRecord.id, record: dbRecord };
  }

  // Case 3: Only rawName provided (legacy string)
  if (rawName) {
    try {
      dbRecord = await prisma.vendorCategory.findFirst({
        where: {
          OR: [
            { name: { equals: rawName, mode: "insensitive" } },
            { slug: rawName.toLowerCase() },
          ],
        },
      });
    } catch {
      // Offline / mock fallback
    }

    if (!dbRecord) {
      const canonical = CANONICAL_VENDOR_CATEGORIES.find(
        (c) => c.name.toLowerCase() === rawName.toLowerCase() || c.slug === rawName.toLowerCase()
      );
      if (canonical) {
        dbRecord = {
          id: `cat-${canonical.slug}`,
          slug: canonical.slug,
          name: canonical.name,
          isActive: true,
        };
      }
    }

    if (!dbRecord) {
      throw { status: 400, message: `Invalid trade category '${rawName}'. Category not found or unapproved.` };
    }

    if (!dbRecord.isActive) {
      throw { status: 400, message: `Trade category '${dbRecord.name}' is inactive and cannot be selected` };
    }

    return { category: dbRecord.name, categoryId: dbRecord.id, record: dbRecord };
  }

  return { category: null, categoryId: null, record: null };
}

/**
 * Resolves and validates subcategories for vendor registration.
 *
 * Rules:
 * - Must be an array of IDs or slugs.
 * - Subcategories require a primary category to be selected.
 * - Every subcategory must exist and be active.
 * - Every subcategory must belong to the selected primary category (cross-category throws 400).
 * - Deduplicates identical subcategories safely.
 */
export async function resolveSubcategories(
  prisma: PrismaClient | any,
  rawSubcategories: any,
  primaryCategoryId: string | null,
  primaryCategoryName: string | null
): Promise<string[]> {
  if (!rawSubcategories) {
    return [];
  }

  if (!Array.isArray(rawSubcategories)) {
    throw { status: 400, message: "Subcategories must be an array of IDs or slugs" };
  }

  if (rawSubcategories.length === 0) {
    return [];
  }

  if (!primaryCategoryId) {
    throw { status: 400, message: "Cannot select subcategories without selecting a primary trade category" };
  }

  const seenIds = new Set<string>();
  const resolvedIds: string[] = [];

  for (const item of rawSubcategories) {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw { status: 400, message: "Invalid subcategory identifier in request payload" };
    }

    const subIdOrSlug = item.trim();
    let subRecord: any = null;

    try {
      subRecord = await prisma.vendorSubcategory.findFirst({
        where: {
          OR: [{ id: subIdOrSlug }, { slug: subIdOrSlug.toLowerCase() }],
        },
      });
    } catch {
      // Offline / mock fallback
    }

    if (!subRecord) {
      for (const cat of CANONICAL_VENDOR_CATEGORIES) {
        const foundSub = cat.subcategories.find(
          (s) => s.slug === subIdOrSlug.toLowerCase() || `sub-${s.slug}` === subIdOrSlug
        );
        if (foundSub) {
          subRecord = {
            id: `sub-${foundSub.slug}`,
            categoryId: `cat-${cat.slug}`,
            slug: foundSub.slug,
            name: foundSub.name,
            isActive: true,
          };
          break;
        }
      }
    }

    if (!subRecord) {
      throw { status: 400, message: `Invalid subcategory '${subIdOrSlug}': subcategory not found` };
    }

    if (!subRecord.isActive) {
      throw { status: 400, message: `Subcategory '${subRecord.name}' is inactive and cannot be selected` };
    }

    // Verify parent category matching
    if (subRecord.categoryId !== primaryCategoryId) {
      throw {
        status: 400,
        message: `Subcategory '${subRecord.name}' does not belong to the selected primary category '${primaryCategoryName || primaryCategoryId}'`,
      };
    }

    if (!seenIds.has(subRecord.id)) {
      seenIds.add(subRecord.id);
      resolvedIds.push(subRecord.id);
    }
  }

  return resolvedIds;
}
