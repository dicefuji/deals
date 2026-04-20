import test from "node:test";
import assert from "node:assert/strict";

import { extractPromoSnippets, looksLikePromoSnippet } from "../src/collectors/shared.js";

test("looksLikePromoSnippet rejects giant page-shell blobs", () => {
  const shellText = "Skip to main content LeftSideNavigationBarIcon Loading Home Icon Loading Sign up or Login DoorDash Icon Loading";
  assert.equal(looksLikePromoSnippet(shellText), false);
});

test("extractPromoSnippets filters page chrome and keeps deal-sized text", () => {
  const rawTexts = [
    "Skip to main content LeftSideNavigationBarIcon Loading Home Icon Loading Sign up or Login DoorDash Icon Loading",
    "Safeway 38 min SNAP 15% off Signature Select Refreshe Purified Drinking Water Bottles (16.9 oz x 24 ct ct)",
    "Blueberries (6 oz) 50% off",
    "Kraft Original Mac & Cheese (2.05 oz × 4 ct) Buy 2, save $2",
    "Checking if the site connection is secured..."
  ];

  const snippets = extractPromoSnippets(rawTexts);

  assert.deepEqual(snippets, [
    "15% off Signature Select Refreshe Purified Drinking Water Bottles (16.9 oz x 24 ct ct)",
    "Blueberries (6 oz) 50% off",
    "Kraft Original Mac & Cheese (2.05 oz × 4 ct) Buy 2, save $2"
  ]);
});
