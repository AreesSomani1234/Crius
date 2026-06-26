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

    const stocks = window.CRIUS_DATA.stocks
      .filter((stock) => `${stock.ticker} ${stock.company} ${stock.sector}`.toLowerCase().includes(query))
      .sort((a, b) => b.score - a.score);

    if (!stocks.length) {
      results.innerHTML = `
        <div class="empty-state search-empty-state">
          <strong>No stocks found</strong>
          <p>Try searching a ticker like NVDA, a company like Microsoft, or a sector like semiconductors.</p>
          <a class="button secondary" href="smart-search.html">Use Smart Search instead</a>
        </div>
      `;
      return;
    }

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
          <span class="tag-pill">${stock.risk} risk</span>
        </div>
      </a>
    `).join("");
  }
};
