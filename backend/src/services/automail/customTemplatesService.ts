import fs from "fs";
import path from "path";

export interface CustomEmailTemplate {
  id: string;
  title: string;
  category: string;
  brand: "hipro" | "hbs" | "all";
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

export function getCustomTemplates(): CustomEmailTemplate[] {
  try {
    if (fs.existsSync(TEMPLATES_FILE_PATH)) {
      const data = fs.readFileSync(TEMPLATES_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[AUTOMAIL] Error reading custom templates:", err);
  }
  return [];
}

export function saveCustomTemplates(templates: CustomEmailTemplate[]): void {
  try {
    fs.writeFileSync(TEMPLATES_FILE_PATH, JSON.stringify(templates, null, 2), "utf-8");
  } catch (err) {
    console.error("[AUTOMAIL] Error writing custom templates:", err);
  }
}

export function createCustomTemplate(input: {
  title: string;
  category?: string;
  brand?: "hipro" | "hbs" | "all";
  description?: string;
  subject: string;
  senderName?: string;
  senderEmail?: string;
  html: string;
}): CustomEmailTemplate {
  const templates = getCustomTemplates();
  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const brand = input.brand || "all";
  const badge = brand === "hipro" ? "HiPRO Custom" : brand === "hbs" ? "Hind Build Custom" : "Custom Template";

  const newTemplate: CustomEmailTemplate = {
    id,
    title: input.title.trim() || "Untitled Custom Template",
    category: input.category || "Official Company",
    brand,
    badge,
    description: input.description?.trim() || "Custom official company email template",
    subject: input.subject.trim() || "Update from Hindustan Projects",
    senderName: input.senderName?.trim() || (brand === "hbs" ? "Hind Build Solutions" : "Hindustan Projects"),
    senderEmail: input.senderEmail?.trim() || (brand === "hbs" ? "hbs@hindustanprojects.in" : "info@hindustanprojects.in"),
    html: input.html || "<p>Hello {{name}},</p><p>Your message content here.</p>",
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  templates.unshift(newTemplate);
  saveCustomTemplates(templates);
  return newTemplate;
}

export function updateCustomTemplate(
  id: string,
  updates: Partial<Omit<CustomEmailTemplate, "id" | "createdAt">>
): CustomEmailTemplate | null {
  const templates = getCustomTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = templates[index];
  const updated: CustomEmailTemplate = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  templates[index] = updated;
  saveCustomTemplates(templates);
  return updated;
}

export function deleteCustomTemplate(id: string): boolean {
  const templates = getCustomTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;

  saveCustomTemplates(filtered);
  return true;
}
