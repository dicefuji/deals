import { getMockDeals } from "../data/mockDeals.js";
import { normalizeDeal } from "../lib/normalizeDeal.js";
import { rankDeals } from "../lib/rankDeals.js";
import { runDoorDashDealTask } from "./browserUseClient.js";

function mapPromotionType(type) {
  if (type === "combo_deal") {
    return "amount_off_threshold";
  }

  return type || "unknown";
}

function normalizeBrowserUseDeal(deal) {
  return normalizeDeal({
    platform: "DoorDash",
    storeName: deal.storeName,
    itemName: deal.itemName,
    subtotal: Number(deal.priceBefore || 0),
    total: Number(deal.priceAfter || 0) + Number(deal.deliveryFee || 0) + Number(deal.serviceFee || 0),
    deliveryFee: Number(deal.deliveryFee || 0),
    serviceFee: Number(deal.serviceFee || 0),
    etaMinutes: Number(deal.etaMinutes || 0),
    savings: {
      amount: Number(deal.estimatedSavings || 0)
    },
    promotion: {
      type: mapPromotionType(deal.promotionType),
      label: deal.promotionLabel
    },
    sourceUrl: deal.sourceUrl,
    notes: deal.confidenceNote,
    isDashPassRequired: Boolean(deal.isDashPassRequired)
  });
}

export async function getRecommendations(userInput) {
  if (userInput.mode === "mock") {
    const candidates = getMockDeals();
    return {
      taskId: null,
      sessionId: null,
      liveUrl: null,
      agentSummary: "Mock data mode is active. No Browser Use task was started.",
      candidates,
      ranking: rankDeals(candidates, userInput)
    };
  }

  const result = await runDoorDashDealTask(userInput);
  const candidates = result.structured.deals.map(normalizeBrowserUseDeal);
  if (candidates.length === 0) {
    throw new Error("Browser Use completed, but no restaurant deals were returned.");
  }

  return {
    taskId: result.taskId,
    sessionId: result.sessionId,
    liveUrl: result.liveUrl,
    agentSummary: result.structured.agentSummary,
    candidates,
    ranking: rankDeals(candidates, userInput)
  };
}
