import test from "node:test";
import assert from "node:assert/strict";

import { getRecommendations } from "../src/services/getRecommendations.js";

test("mock recommendations return ranked DoorDash-only results", async () => {
  const result = await getRecommendations({
    query: "Dinner",
    budget: 35,
    maxEtaMinutes: 45,
    prioritizeBogo: true,
    mode: "mock"
  });

  assert.equal(result.ranking[0].promotion.type, "bogo");
  assert.equal(result.ranking.every((deal) => deal.platform === "DoorDash"), true);
});
