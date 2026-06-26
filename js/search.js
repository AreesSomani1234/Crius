window.CriusSearch = {
  renderLanding() {
    const recent = document.querySelector("#recentSearches");
    if (recent) {
      recent.innerHTML = window.CRIUS_DATA.recentSearches.map((item) => `<span class="ticker-pill">${item}</span>`).join("");
    }
  },

  renderStockSearch() {
    const ui = window.CriusUI;
    const query = (document.querySelector("#stockSearchInput")?.value || "").toLowerCase();
    const results = document.querySelector("#stockSearchResults");
    if (!results) return;

    const stocks = window.CRIUS_DATA.stocks.filter((stock) => `${stock.ticker} ${stock.company} ${stock.sector}`.toLowerCase().includes(query));
    results.innerHTML = stocks.map((stock) => `
      <a class="lookup-card glass-card" href="stock-detail.html?ticker=${stock.ticker}">
        <div class="card-topline">
          <div><strong>${stock.ticker}</strong><span class="muted">${stock.company}</span></div>
          <span class="score-pill ${ui.scoreClass(stock.score)}">${stock.score}</span>
        </div>
        <p>${stock.status}</p>
        <div class="tag-row">
          <span class="tag-pill">${stock.sector}</span>
          <span class="tag-pill">${ui.formatPrice(stock.price)}</span>
        </div>
      </a>
    `).join("");
  }
};
