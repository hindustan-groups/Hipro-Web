import fs from "fs";
import path from "path";
import { prisma } from "../../lib/db";

export interface CustomEmailTemplate {
  id: string;
  title: string;
  category: string;
  brand: "hipro" | "hbs" | "empanelment" | "all";
  badge: string;
  description: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  html: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES_FILE_PATH = path.resolve(__dirname, "../../../automail_custom_templates.json");
const DB_TEMPLATES_ROW_ID = "custom_templates_v1";
let cachedTemplates: CustomEmailTemplate[] | null = null;

function readTemplatesFromFile(): CustomEmailTemplate[] {
  try {
    if (fs.existsSync(TEMPLATES_FILE_PATH)) {
      const data = fs.readFileSync(TEMPLATES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("[AUTOMAIL] Error reading custom templates file:", err);
  }
  return [];
}

function writeTemplatesToFile(templates: CustomEmailTemplate[]): void {
  try {
    fs.writeFileSync(TEMPLATES_FILE_PATH, JSON.stringify(templates, null, 2), "utf-8");
  } catch (err) {
    console.error("[AUTOMAIL] Error writing custom templates file:", err);
  }
}

export async function getCustomTemplatesAsync(): Promise<CustomEmailTemplate[]> {
  try {
    const row = await (prisma as any).automailSetting.findUnique({
      where: { id: DB_TEMPLATES_ROW_ID },
    });
    if (row?.hostingerApiToken) {
      const parsed = JSON.parse(row.hostingerApiToken);
      if (Array.isArray(parsed)) {
        cachedTemplates = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[AUTOMAIL] DB custom templates lookup fallback:", err);
  }

  const fileList = readTemplatesFromFile();
  cachedTemplates = fileList;
  return fileList;
}

export function getCustomTemplates(): CustomEmailTemplate[] {
  if (cachedTemplates !== null) return cachedTemplates;
  const list = readTemplatesFromFile();
  cachedTemplates = list;
  getCustomTemplatesAsync().catch(() => null);
  return list;
}

export async function saveCustomTemplates(templates: CustomEmailTemplate[]): Promise<void> {
  cachedTemplates = templates;
  writeTemplatesToFile(templates);
  try {
    await (prisma as any).automailSetting.upsert({
      where: { id: DB_TEMPLATES_ROW_ID },
      create: {
        id: DB_TEMPLATES_ROW_ID,
        deliveryMethod: "smtp",
        hostingerApiToken: JSON.stringify(templates),
      },
      update: {
        hostingerApiToken: JSON.stringify(templates),
      },
    });
  } catch (err) {
    console.error("[AUTOMAIL] Failed to persist custom templates to PostgreSQL:", err);
  }
}

export async function createCustomTemplate(input: {
  title: string;
  category?: string;
  brand?: "hipro" | "hbs" | "empanelment" | "all";
  description?: string;
  subject: string;
  senderName?: string;
  senderEmail?: string;
  html: string;
}): Promise<CustomEmailTemplate> {
  const templates = await getCustomTemplatesAsync();
  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const brand = input.brand || "all";
  const badge =
    brand === "hipro"
      ? "HiPRO Custom"
      : brand === "hbs"
      ? "Hind Build Custom"
      : brand === "empanelment"
      ? "Empanelment Custom"
      : "Custom Template";

  const newTemplate: CustomEmailTemplate = {
    id,
    title: input.title.trim() || "Untitled Custom Template",
    category: input.category || "Official Company",
    brand,
    badge,
    description: input.description?.trim() || "Custom official company email template",
    subject: input.subject.trim() || "Update from Hindustan Projects",
    senderName:
      input.senderName?.trim() ||
      (brand === "hbs"
        ? "Hind Building Solutions"
        : brand === "empanelment"
        ? "HiPRO Empanelment Desk"
        : "Hindustan Projects"),
    senderEmail: input.senderEmail?.trim() || "info@hindustanprojects.in",
    html: input.html || "<p>Hello {{name}},</p><p>Your message content here.</p>",
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  templates.unshift(newTemplate);
  await saveCustomTemplates(templates);
  return newTemplate;
}

export async function updateCustomTemplate(
  id: string,
  updates: Partial<Omit<CustomEmailTemplate, "id" | "createdAt">>
): Promise<CustomEmailTemplate | null> {
  const templates = await getCustomTemplatesAsync();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = templates[index];
  const updated: CustomEmailTemplate = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  templates[index] = updated;
  await saveCustomTemplates(templates);
  return updated;
}

export async function deleteCustomTemplate(id: string): Promise<boolean> {
  const templates = await getCustomTemplatesAsync();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;

  await saveCustomTemplates(filtered);
  return true;
}
