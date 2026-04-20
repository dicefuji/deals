import { createDeal, extractPromoSnippets, withBrowserSession } from "./shared.js";

export async function collectUberEatsDeals(userInput = {}) {
  return withBrowserSession(async (page) => {
    await page.goto("https://www.ubereats.com/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const rawTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a, article, [data-testid], button, p, span"))
        .map((node) => node.textContent || "")
    );
    const deals = extractPromoSnippets(rawTexts);

    if (deals.length === 0) {
      throw new Error("No Uber Eats deals detected. Sign in and make sure the home page shows offers for your address.");
    }

    return deals.map((deal, index) => createDeal({
      platform: "Uber Eats",
      storeName: `Uber Eats Offer ${index + 1}`,
      cuisine: userInput.cuisine || "Any",
      rating: 4.4,
      etaMinutes: 24 + index,
      subtotal: 29,
      fees: 4.99,
      savings: { amount: 9 - index, percent: 20 },
      promotion: { label: deal },
      sourceUrl: "https://www.ubereats.com/",
      notes: "Live collector filters visible promo-sized snippets and applies heuristic pricing."
    }));
  });
}
