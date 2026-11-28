import { prisma } from "./db";

/**
 * Returns whether the Site / Gate Pass module is currently enabled by Admin.
 * Defaults to false (disabled) if not configured or on error.
 */
export async function isGatePassEnabled(): Promise<boolean> {
  try {
    const content = await prisma.empanelmentContent.findUnique({
      where: { id: "singleton" },
      select: { gatePassEnabled: true },
    });
    return Boolean(content?.gatePassEnabled);
  } catch {
    return false;
  }
}
