window.CriusApp = {
  render() {
    const page = document.body.dataset.page;
    window.CriusNavigation.render();

    if (page === "home") window.CriusWatchlist.renderHome();
    if (page === "watchlist") window.CriusWatchlist.renderPage();
    if (page === "search") window.CriusSearch.renderLanding();
    if (page === "stock-search") window.CriusSearch.renderStockSearch();
    if (page === "smart-search") window.CriusSmartSearch.render();
    if (page === "hot-stocks") this.renderHotStocks();
    if (page === "articles") window.CriusArticles.renderPage();
    if (page === "stock-detail") window.CriusStocks.renderDetail();
    if (page === "profile") this.renderProfile();
    if (page === "markets") this.renderMarkets();
    if (page === "compare") this.renderCompare();

    window.CriusUI.bindCommonActions();
  },

  renderHotStocks() {
    const ui = window.CriusUI;
    const grid = document.querySelector("#hotStocksGrid");
    const count = document.querySelector("#hotStocksCount");
    const query = (document.querySelector("#hotStocksSearch")?.value || "").toLowerCase();
    const sector = document.querySelector("#sectorFilter")?.value || "All";
    const cap = document.querySelector("#capFilter")?.value || "All";
    const stocks = window.CRIUS_DATA.stocks.filter((stock) => {
      const textMatch = `${stock.ticker} ${stock.company} ${stock.sector} ${stock.aiTag}`.toLowerCase().includes(query);
      const sectorMatch = sector === "All" || stock.sector === sector;
      const capMatch = cap === "All" || stock.marketCap === cap;
      return textMatch && sectorMatch && capMatch;
    });

    if (grid) {
      grid.innerHTML = stocks.map((stock) => ui.trendCard(stock, `stock-detail.html?ticker=${stock.ticker}`)).join("");
      count.textContent = `Showing ${stocks.length} AI-curated stocks`;
    }
  },

  renderProfile() {
    const user = window.CRIUS_DATA.user;
    const profile = document.querySelector("#profileContent");
    if (!profile) return;
    profile.innerHTML = `
      <div class="profile-grid">
        <aside class="profile-card glass-card">
          <div class="avatar">${user.name.charAt(0)}</div>
          <h2>${user.name} Somani</h2>
          <p>${user.profile} investor profile</p>
          <div class="tag-row">${user.favoriteSectors.map((sector) => `<span class="tag-pill">${sector}</span>`).join("")}</div>
        </aside>
        <section class="settings-list">
          ${["Settings", "Risk tolerance: " + user.riskTolerance, "Favorite sectors", "Theme: " + user.theme, "Notifications: On", "Subscription: " + user.plan, "Payment", "Privacy", "Support", "Logout"].map((item) => `<article class="glass-card"><strong>${item}</strong><p class="muted">Prototype setting prepared for future backend integration.</p></article>`).join("")}
        </section>
      </div>
    `;
  },

  renderMarkets() {
    const target = document.querySelector("#marketsContent");
    if (!target) return;
    target.innerHTML = window.CRIUS_DATA.stocks.slice(0, 6).map((stock) => window.CriusUI.stockCard(stock, `stock-detail.html?ticker=${stock.ticker}`)).join("");
  },

  renderCompare() {
    const target = document.querySelector("#compareContent");
    if (!target) return;
    target.innerHTML = window.CRIUS_DATA.stocks.slice(0, 3).map((stock) => `
      <article class="stat-card glass-card">
        <h3>${stock.ticker}</h3>
        <p>${stock.company}</p>
        <strong>${stock.score}/100</strong>
        <p>${stock.outlook}</p>
      </article>
    `).join("");
  },

  bindInputs() {
    ["#watchlistSearch", "#stockSearchInput", "#hotStocksSearch", "#sectorFilter", "#capFilter"].forEach((selector) => {
      const input = document.querySelector(selector);
      if (input) input.addEventListener("input", () => this.render());
      if (input) input.addEventListener("change", () => this.render());
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.CriusApp.bindInputs();
  window.CriusApp.render();
});
