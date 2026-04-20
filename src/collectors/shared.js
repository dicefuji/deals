import { normalizeDeal } from "../lib/normalizeDeal.js";

const promoPattern = /\b(\d+%\s*off|buy\s*\d+.*get\s*\d+|bogo|free delivery|free item|save \$\d+|\$\d+\s*off|with store membership)\b/i;
const blockedFragments = [
  "skip to main content",
  "checking if the site connection is secured",
  "sign up or login",
  "items in cart",
  "visit store",
  "icon loading",
  "leftsidenavigationbaricon"
];

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

export function cleanVisibleText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/Icon Loading/gi, " ")
    .trim();
}

export function trimToPromoStart(text) {
  const normalizedText = cleanVisibleText(text);
  const match = normalizedText.match(/(buy\s*\d+.*get\s*\d+|bogo|free delivery|free item|save \$\d+|\$\d+\s*off|\d+%\s*off|with store membership)/i);

  if (!match || match.index === 0) {
    return normalizedText;
  }

  const suffix = normalizedText.slice(match.index).trim();
  return suffix.length >= 8 ? suffix : normalizedText;
}

export function looksLikePromoSnippet(text) {
  const normalizedText = trimToPromoStart(text);

  if (!normalizedText || normalizedText.length < 8 || normalizedText.length > 140) {
    return false;
  }

  const lower = normalizedText.toLowerCase();
  if (blockedFragments.some((fragment) => lower.includes(fragment))) {
    return false;
  }

  return promoPattern.test(normalizedText);
}

export function extractPromoSnippets(rawTexts, limit = 8) {
  const snippets = [];
  const seen = new Set();

  for (const rawText of rawTexts) {
    const normalizedText = cleanVisibleText(rawText);
    if (!normalizedText) {
      continue;
    }

    if (looksLikePromoSnippet(normalizedText)) {
      const trimmedText = trimToPromoStart(normalizedText);
      const dedupeKey = trimmedText.toLowerCase();
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        snippets.push(trimmedText);

        if (snippets.length >= limit) {
          return snippets;
        }
      }
      continue;
    }

    const candidates = normalizedText
      .split(/(?=\b(?:\d+%\s*off|Buy\s*\d+|BOGO|Free delivery|Free item|Save \$\d+|\$\d+\s*off|with store membership)\b)/i)
      .map((candidate) => trimToPromoStart(candidate));

    for (const candidate of candidates) {
      if (!looksLikePromoSnippet(candidate)) {
        continue;
      }

      const dedupeKey = candidate.toLowerCase();
      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      snippets.push(candidate);

      if (snippets.length >= limit) {
        return snippets;
      }
    }
  }

  return snippets;
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
