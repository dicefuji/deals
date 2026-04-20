import { getMockDeals } from "../data/mockDeals.js";
import { collectDoorDashDeals } from "../collectors/doordash.js";
import { collectUberEatsDeals } from "../collectors/ubereats.js";

export async function collectDeals({ mode = "mock", userInput }) {
  if (mode !== "live") {
    return getMockDeals(userInput);
  }

  const [doordashDeals, uberEatsDeals] = await Promise.all([
    collectDoorDashDeals(userInput),
    collectUberEatsDeals(userInput)
  ]);

  return [...doordashDeals, ...uberEatsDeals];
}
