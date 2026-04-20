const form = document.querySelector("#deal-form");
const results = document.querySelector("#results");
const setupStatus = document.querySelector("#setup-status");

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function render(response) {
  const [topDeal, ...alternates] = response.ranking;
  if (!topDeal) {
    results.innerHTML = `<section class="panel"><p>No deals were returned.</p></section>`;
    return;
  }
  const runDetails = response.taskId
    ? `<p class="muted">Browser Use task <code>${response.taskId}</code>${response.liveUrl ? ` • <a href="${response.liveUrl}" target="_blank" rel="noreferrer">Watch live run</a>` : ""}</p>`
    : `<p class="muted">Using local mock data.</p>`;

  results.innerHTML = `
    <article class="panel winner">
      <p class="eyebrow">Best match</p>
      <h2>${topDeal.storeName}</h2>
      <p class="headline">${topDeal.itemName || "Recommended item"}</p>
      ${runDetails}
      <p>${response.agentSummary || ""}</p>
      <p class="headline">${topDeal.promotion.label}</p>
      <p>${topDeal.explanation}</p>
      <dl class="stats">
        <div><dt>Total</dt><dd>${currency(topDeal.total)}</dd></div>
        <div><dt>Savings</dt><dd>${currency(topDeal.savings.amount)}</dd></div>
        <div><dt>Fees</dt><dd>${currency(topDeal.fees)}</dd></div>
        <div><dt>ETA</dt><dd>${topDeal.etaMinutes} min</dd></div>
        <div><dt>Score</dt><dd>${topDeal.score}</dd></div>
      </dl>
    </article>
    <section class="panel">
      <h3>Alternates</h3>
      <div class="cards">
        ${alternates.map((deal) => `
          <article class="card">
            <p class="card-title">${deal.storeName}</p>
            <p>${deal.itemName || "Candidate item"}</p>
            <p>${deal.promotion.label}</p>
            <p>${currency(deal.total)} total • ${currency(deal.fees)} fees • ${deal.etaMinutes} min</p>
            <p class="muted">${deal.explanation}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

async function loadSetupStatus() {
  const response = await fetch("/api/health");
  const data = await response.json();

  setupStatus.textContent = data.browserUseConfigured
    ? `Browser Use is configured. Live mode will use model ${data.model}.`
    : "Browser Use is not configured yet. Set BROWSER_USE_API_KEY and BROWSER_USE_PROFILE_ID, or use mock data.";
}

async function loadRecommendations(payload) {
  results.innerHTML = `<section class="panel"><p>Collecting and ranking deals...</p></section>`;

  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    results.innerHTML = `<section class="panel"><p>${data.error}</p><p class="muted">${data.hint || ""}</p></section>`;
    return;
  }

  render(data);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.budget = Number(payload.budget);
  payload.maxEtaMinutes = Number(payload.maxEtaMinutes);
  payload.prioritizeBogo = form.elements.prioritizeBogo.checked;
  loadRecommendations(payload);
});

loadSetupStatus();
loadRecommendations({
  query: "Dinner",
  budget: 35,
  maxEtaMinutes: 45,
  prioritizeBogo: true,
  mode: "mock"
});
