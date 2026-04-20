export function normalizeDeal(input) {
  const savingsAmount = Number(input.savings?.amount || 0);
  const subtotal = Number(input.subtotal || 0);
  const fees = Number(input.fees || 0);
  const total = Number(input.total || subtotal + fees - savingsAmount);
  const savingsPercent = subtotal > 0
    ? Math.round((savingsAmount / subtotal) * 100)
    : 0;

  return {
    platform: input.platform,
    storeName: input.storeName,
    cuisine: input.cuisine || "Any",
    rating: Number(input.rating || 0),
    etaMinutes: Number(input.etaMinutes || 0),
    subtotal,
    fees,
    total,
    savings: {
      amount: savingsAmount,
      percent: input.savings?.percent ? Number(input.savings.percent) : savingsPercent
    },
    promotion: {
      type: input.promotion?.type || "unknown",
      label: input.promotion?.label || "Unknown promotion"
    },
    sourceUrl: input.sourceUrl || null,
    notes: input.notes || null
  };
}
