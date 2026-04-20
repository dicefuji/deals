import { createDeal, extractPromoSnippets, withBrowserSession } from "./shared.js";

export async function collectDoorDashDeals(userInput = {}) {
  return withBrowserSession(async (page) => {
    await page.goto("https://www.doordash.com/browse/deals", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const rawTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a, article, [data-testid], button, p, span"))
        .map((node) => node.textContent || "")
    );
    const deals = extractPromoSnippets(rawTexts);

    if (deals.length === 0) {
      throw new Error("No DoorDash deals detected. Sign in and make sure the page shows offers for your address.");
    }

    return deals.map((deal, index) => createDeal({
      platform: "DoorDash",
      storeName: `DoorDash Offer ${index + 1}`,
      cuisine: userInput.cuisine || "Any",
      rating: 4.3,
      etaMinutes: 30 + index,
      subtotal: 28,
      fees: 5.99,
      savings: { amount: 10 - index, percent: 25 },
      promotion: { label: deal },
      sourceUrl: "https://www.doordash.com/browse/deals",
      notes: "Live collector filters visible promo-sized snippets and applies heuristic pricing."
    }));
  });
}
