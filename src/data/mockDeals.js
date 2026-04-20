import { normalizeDeal } from "../lib/normalizeDeal.js";

const mockDeals = [
  {
    platform: "DoorDash",
    storeName: "Dragon Bowl",
    itemName: "Two chicken teriyaki bowls",
    rating: 4.7,
    etaMinutes: 31,
    subtotal: 30,
    deliveryFee: 1.99,
    serviceFee: 5,
    savings: { amount: 15, percent: 50 },
    promotion: { type: "bogo", label: "Buy 1, Get 1 Rice Bowl" },
    sourceUrl: "https://www.doordash.com/",
    notes: "Strong headline deal with moderate fees."
  },
  {
    platform: "DoorDash",
    storeName: "Burger Theory",
    itemName: "Double cheeseburger combo",
    rating: 4.5,
    etaMinutes: 24,
    subtotal: 26,
    deliveryFee: 0,
    serviceFee: 4.49,
    savings: { amount: 7.8, percent: 30 },
    promotion: { type: "percent_off", label: "30% off $25+" },
    sourceUrl: "https://www.doordash.com/",
    notes: "Faster ETA, lower total, weaker promo type than BOGO."
  },
  {
    platform: "DoorDash",
    storeName: "Taco Verde",
    itemName: "Carnitas burrito",
    rating: 4.8,
    etaMinutes: 28,
    subtotal: 24,
    deliveryFee: 0,
    serviceFee: 3.99,
    savings: { amount: 0, percent: 0 },
    promotion: { type: "free_delivery", label: "$0 delivery fee" },
    sourceUrl: "https://www.doordash.com/",
    notes: "Cheap total with no major item discount."
  },
  {
    platform: "DoorDash",
    storeName: "Pasta House",
    itemName: "Spicy vodka rigatoni",
    rating: 4.4,
    etaMinutes: 36,
    subtotal: 32,
    deliveryFee: 2.99,
    serviceFee: 3,
    savings: { amount: 12, percent: 38 },
    promotion: { type: "amount_off_threshold", label: "$12 off $30+" },
    sourceUrl: "https://www.doordash.com/",
    notes: "Good savings but threshold-based."
  }
];

export function getMockDeals() {
  return mockDeals.map((deal) => normalizeDeal(deal));
}
