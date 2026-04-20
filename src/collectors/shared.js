import { normalizeDeal } from "../lib/normalizeDeal.js";

export async function getPlaywright() {
  try {
    const playwright = await import("playwright");
    return playwright;
  } catch {
    throw new Error("Playwright is not installed. Run `npm install` before using live mode.");
  }
}

export function detectPromotionType(label) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("buy 1") || normalizedLabel.includes("bogo")) {
    return "bogo";
  }
  if (normalizedLabel.includes("free item")) {
    return "free_item";
  }
  if (normalizedLabel.includes("%")) {
    return "percent_off";
  }
  if (normalizedLabel.includes("$") && normalizedLabel.includes("off")) {
    return "amount_off_threshold";
  }
  if (normalizedLabel.includes("delivery")) {
    return "free_delivery";
  }
  if (normalizedLabel.includes("member")) {
    return "membership_only";
  }

  return "unknown";
}

export function createDeal(input) {
  return normalizeDeal({
    ...input,
    promotion: {
      type: input.promotion?.type || detectPromotionType(input.promotion?.label || ""),
      label: input.promotion?.label || "Unknown promotion"
    }
  });
}

export async function withBrowserSession(collector) {
  const playwright = await getPlaywright();
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    return await collector(page);
  } finally {
    await browser.close();
  }
}
