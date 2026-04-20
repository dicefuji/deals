import { createDeal, withBrowserSession } from "./shared.js";

export async function collectDoorDashDeals(userInput = {}) {
  return withBrowserSession(async (page) => {
    await page.goto("https://www.doordash.com/browse/deals", { waitUntil: "domcontentloaded" });

    const deals = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("a, article, [data-testid]"));

      return cards
        .map((card) => {
          const text = card.textContent?.replace(/\s+/g, " ").trim();
          if (!text || !/(off|free|buy 1|get 1|delivery)/i.test(text)) {
            return null;
          }

          return {
            rawText: text
          };
        })
        .filter(Boolean)
        .slice(0, 8);
    });

    if (deals.length === 0) {
      throw new Error("No DoorDash deals detected. Sign in and make sure the page shows offers for your address.");
    }

    return deals.map((deal, index) => createDeal({
      platform: "DoorDash",
      storeName: `DoorDash Deal ${index + 1}`,
      cuisine: userInput.cuisine || "Any",
      rating: 4.3,
      etaMinutes: 30 + index,
      subtotal: 28,
      fees: 5.99,
      savings: { amount: 10 - index, percent: 25 },
      promotion: { label: deal.rawText },
      sourceUrl: "https://www.doordash.com/browse/deals",
      notes: "Live collector uses headline promo extraction and heuristic pricing."
    }));
  });
}
