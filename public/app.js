const form = document.querySelector("#deal-form");
const results = document.querySelector("#results");

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function render(response) {
  const [topDeal, ...alternates] = response.ranking;

  results.innerHTML = `
    <article class="panel winner">
      <p class="eyebrow">Best match</p>
      <h2>${topDeal.storeName} on ${topDeal.platform}</h2>
      <p class="headline">${topDeal.promotion.label}</p>
      <p>${topDeal.explanation}</p>
      <dl class="stats">
        <div><dt>Total</dt><dd>${currency(topDeal.total)}</dd></div>
        <div><dt>Savings</dt><dd>${currency(topDeal.savings.amount)}</dd></div>
        <div><dt>ETA</dt><dd>${topDeal.etaMinutes} min</dd></div>
        <div><dt>Score</dt><dd>${topDeal.score}</dd></div>
      </dl>
    </article>
    <section class="panel">
      <h3>Alternates</h3>
      <div class="cards">
        ${alternates.map((deal) => `
          <article class="card">
            <p class="card-title">${deal.storeName} <span>${deal.platform}</span></p>
            <p>${deal.promotion.label}</p>
            <p>${currency(deal.total)} total • ${deal.etaMinutes} min</p>
            <p class="muted">${deal.explanation}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
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

loadRecommendations({
  query: "Dinner",
  address: "San Francisco, CA",
  budget: 35,
  maxEtaMinutes: 45,
  prioritizeBogo: true,
  cuisine: "Any",
  mode: "mock"
});
