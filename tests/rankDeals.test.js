import test from "node:test";
import assert from "node:assert/strict";

import { normalizeDeal } from "../src/lib/normalizeDeal.js";
import { rankDeals, scoreDeal } from "../src/lib/rankDeals.js";

test("normalizeDeal computes total and savings percent", () => {
  const deal = normalizeDeal({
    platform: "DoorDash",
    storeName: "Example",
    subtotal: 20,
    fees: 5,
    savings: { amount: 10 },
    promotion: { type: "bogo", label: "BOGO" }
  });

  assert.equal(deal.total, 15);
  assert.equal(deal.savings.percent, 50);
});

test("ranking prefers BOGO when totals are otherwise close", () => {
  const deals = [
    normalizeDeal({
      platform: "DoorDash",
      storeName: "Bogo Shop",
      cuisine: "Asian",
      rating: 4.6,
      etaMinutes: 30,
      subtotal: 30,
      fees: 5,
      savings: { amount: 15 },
      promotion: { type: "bogo", label: "Buy 1 Get 1" }
    }),
    normalizeDeal({
      platform: "Uber Eats",
      storeName: "Percent Shop",
      cuisine: "Asian",
      rating: 4.6,
      etaMinutes: 28,
      subtotal: 30,
      fees: 4,
      savings: { amount: 9 },
      promotion: { type: "percent_off", label: "30% off" }
    })
  ];

  const ranking = rankDeals(deals, { prioritizeBogo: true, budget: 40, maxEtaMinutes: 45 });
  assert.equal(ranking[0].storeName, "Bogo Shop");
});

test("budget overruns reduce score", () => {
  const affordableDeal = normalizeDeal({
    platform: "DoorDash",
    storeName: "Affordable",
    rating: 4.5,
    etaMinutes: 25,
    subtotal: 22,
    fees: 4,
    savings: { amount: 3 },
    promotion: { type: "free_delivery", label: "Free delivery" }
  });
  const expensiveDeal = normalizeDeal({
    platform: "Uber Eats",
    storeName: "Expensive",
    rating: 4.5,
    etaMinutes: 25,
    subtotal: 36,
    fees: 8,
    savings: { amount: 5 },
    promotion: { type: "free_delivery", label: "Free delivery" }
  });

  assert.ok(
    scoreDeal(affordableDeal, { budget: 30 }) > scoreDeal(expensiveDeal, { budget: 30 })
  );
});
