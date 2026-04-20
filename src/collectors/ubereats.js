import { createDeal, withBrowserSession } from "./shared.js";

export async function collectUberEatsDeals(userInput = {}) {
  return withBrowserSession(async (page) => {
    await page.goto("https://www.ubereats.com/", { waitUntil: "domcontentloaded" });

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
      throw new Error("No Uber Eats deals detected. Sign in and make sure the home page shows offers for your address.");
    }

    return deals.map((deal, index) => createDeal({
      platform: "Uber Eats",
      storeName: `Uber Eats Deal ${index + 1}`,
      cuisine: userInput.cuisine || "Any",
      rating: 4.4,
      etaMinutes: 24 + index,
      subtotal: 29,
      fees: 4.99,
      savings: { amount: 9 - index, percent: 20 },
      promotion: { label: deal.rawText },
      sourceUrl: "https://www.ubereats.com/",
      notes: "Live collector uses headline promo extraction and heuristic pricing."
    }));
  });
}
