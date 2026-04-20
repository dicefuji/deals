const promotionWeights = {
  bogo: 120,
  free_item: 95,
  amount_off_threshold: 75,
  percent_off: 70,
  free_delivery: 45,
  membership_only: 20,
  unknown: 10
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function scoreDeal(deal, preferences = {}) {
  const promoWeight = promotionWeights[deal.promotion.type] ?? promotionWeights.unknown;
  const bogoBoost = preferences.prioritizeBogo && deal.promotion.type === "bogo" ? 40 : 0;
  const budgetPenalty = preferences.budget && deal.total > preferences.budget
    ? Math.min((deal.total - preferences.budget) * 3, 40)
    : 0;
  const etaPenalty = preferences.maxEtaMinutes && deal.etaMinutes > preferences.maxEtaMinutes
    ? Math.min((deal.etaMinutes - preferences.maxEtaMinutes) * 1.5, 30)
    : 0;
  const cuisineBoost = preferences.cuisine &&
    preferences.cuisine !== "Any" &&
    deal.cuisine.toLowerCase() === preferences.cuisine.toLowerCase()
    ? 15
    : 0;
  const savingsScore = clamp(deal.savings.amount * 3 + deal.savings.percent * 1.2, 0, 120);
  const totalScore = clamp(90 - deal.total * 1.2, 0, 90);
  const etaScore = clamp(40 - deal.etaMinutes * 0.7, 0, 40);
  const ratingScore = clamp((deal.rating - 3.5) * 16, 0, 25);

  return Math.round(
    promoWeight +
    bogoBoost +
    cuisineBoost +
    savingsScore +
    totalScore +
    etaScore +
    ratingScore -
    budgetPenalty -
    etaPenalty
  );
}

export function explainDeal(deal, preferences = {}) {
  const reasons = [];

  if (deal.promotion.type === "bogo") {
    reasons.push("BOGO is ranked highest by default");
  } else {
    reasons.push(`${deal.promotion.label} is factored after stronger promo types`);
  }

  reasons.push(`estimated total is $${deal.total.toFixed(2)}`);
  reasons.push(`estimated savings is $${deal.savings.amount.toFixed(2)} (${deal.savings.percent}%)`);

  if (preferences.maxEtaMinutes) {
    reasons.push(`ETA is ${deal.etaMinutes} min`);
  }

  return reasons.join("; ");
}

export function rankDeals(deals, preferences = {}) {
  return deals
    .map((deal) => ({
      ...deal,
      score: scoreDeal(deal, preferences),
      explanation: explainDeal(deal, preferences)
    }))
    .sort((left, right) => right.score - left.score || left.total - right.total || left.etaMinutes - right.etaMinutes);
}
