window.CriusApp = {
  sectorOptions: ["AI infrastructure", "Cloud", "Consumer platforms", "Semiconductors", "Electric Vehicles", "Digital Advertising", "Streaming Media", "AI Software", "Search and Cloud"],

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
    if (page === "auth") this.renderAuthPage();
    if (page === "markets") this.renderMarkets();
    if (page === "compare") this.renderCompare();

    window.CriusUI.bindCommonActions();
  },

  getPreferredSectors() {
    const saved = localStorage.getItem("criusPreferredSectors");
    if (!saved) return window.CRIUS_DATA.user.favoriteSectors;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length ? parsed : window.CRIUS_DATA.user.favoriteSectors;
    } catch {
      return window.CRIUS_DATA.user.favoriteSectors;
    }
  },

  savePreferredSectors(sectors) {
    localStorage.setItem("criusPreferredSectors", JSON.stringify(sectors));
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

    const favorites = window.CriusUI.getFavorites();
    const savedSearches = window.CRIUS_DATA.smartSearches;
    const sectors = this.getPreferredSectors();

    profile.innerHTML = `
      <div class="profile-dashboard">
        <aside class="profile-card glass-card profile-summary-card">
          <div class="avatar">${user.name.charAt(0)}</div>
          <h2>${user.name} Somani</h2>
          <p>${user.profile} investor profile</p>
          <div class="tag-row">${sectors.map((sector) => `<span class="tag-pill">${sector}</span>`).join("")}</div>
          <div class="profile-actions">
            <a class="button primary" href="login.html">Login</a>
            <a class="button secondary" href="signup.html">Sign up</a>
          </div>
        </aside>

        <section class="profile-main-panel">
          <div class="profile-metrics">
            <article class="stat-card glass-card"><span>Investor Type</span><strong>${user.profile}</strong></article>
            <article class="stat-card glass-card"><span>Risk Tolerance</span><strong>${user.riskTolerance}</strong></article>
            <article class="stat-card glass-card"><span>Watchlist Count</span><strong>${favorites.length || 4}</strong></article>
            <article class="stat-card glass-card"><span>Saved Searches</span><strong>${savedSearches.length}</strong></article>
          </div>

          <div class="profile-grid-two">
            <article class="profile-panel glass-card">
              <div class="section-heading"><div><h2>Risk Preferences</h2><p>Prototype controls for future account personalization.</p></div></div>
              <label class="slider-label"><span>Risk level</span><strong>${user.riskTolerance}</strong></label>
              <input class="risk-slider" type="range" min="1" max="5" value="3" aria-label="Risk tolerance slider" />
              <div class="slider-scale"><span>Conservative</span><span>Balanced</span><span>Aggressive</span></div>
            </article>

            <article class="profile-panel glass-card">
              <div class="section-heading"><div><h2>Preferred Sectors</h2><p>Used by Smart Search and stock ranking screens.</p></div></div>
              <div class="tag-row" id="sectorPills">${sectors.map((sector) => `<span class="tag-pill active-sector">${sector}</span>`).join("")}</div>
              <button class="button secondary" type="button" id="editSectorsButton">Edit sector list</button>
              <div class="sector-editor" id="sectorEditor" hidden>
                ${this.sectorOptions.map((sector) => `
                  <label class="sector-option">
                    <input type="checkbox" value="${sector}" ${sectors.includes(sector) ? "checked" : ""} />
                    <span>${sector}</span>
                  </label>
                `).join("")}
                <div class="sector-editor-actions">
                  <button class="button primary" type="button" id="saveSectorsButton">Save sectors</button>
                  <button class="button secondary" type="button" id="cancelSectorsButton">Cancel</button>
                </div>
              </div>
            </article>
          </div>

          <div class="profile-grid-two">
            <article class="profile-panel glass-card">
              <div class="section-heading"><div><h2>Saved Searches</h2><p>Recent AI screens saved to this prototype account.</p></div></div>
              <div class="saved-search-list">
                ${savedSearches.map((search) => `
                  <div class="saved-search-item">
                    <strong>${search.title}</strong>
                    <span>${search.summary}</span>
                    <div class="ticker-row">${search.tickers.map((ticker) => `<span class="ticker-pill">${ticker}</span>`).join("")}</div>
                  </div>
                `).join("")}
              </div>
            </article>

            <article class="profile-panel glass-card">
              <div class="section-heading"><div><h2>Account Settings</h2><p>Prepared for backend integration later.</p></div></div>
              <div class="settings-list compact-settings">
                <article><strong>Theme</strong><span>${user.theme}</span></article>
                <article><strong>Notifications</strong><span>${user.notifications ? "On" : "Off"}</span></article>
                <article><strong>Subscription</strong><span>${user.plan}</span></article>
                <article><strong>Privacy</strong><span>Standard prototype mode</span></article>
              </div>
            </article>
          </div>
        </section>
      </div>
    `;

    this.bindProfileControls();
  },

  bindProfileControls() {
    const editor = document.querySelector("#sectorEditor");
    const editButton = document.querySelector("#editSectorsButton");
    const cancelButton = document.querySelector("#cancelSectorsButton");
    const saveButton = document.querySelector("#saveSectorsButton");

    editButton?.addEventListener("click", () => {
      editor.hidden = false;
      editButton.hidden = true;
    });

    cancelButton?.addEventListener("click", () => {
      this.renderProfile();
    });

    saveButton?.addEventListener("click", () => {
      const selected = [...document.querySelectorAll("#sectorEditor input:checked")].map((input) => input.value);
      this.savePreferredSectors(selected.length ? selected : window.CRIUS_DATA.user.favoriteSectors);
      this.renderProfile();
    });
  },

  renderAuthPage() {
    const target = document.querySelector("#authContent");
    if (!target) return;

    const mode = document.body.dataset.authMode || "login";
    const isSignup = mode === "signup";
    const isForgot = mode === "forgot";
    const title = isSignup ? "Create your Crius account" : isForgot ? "Reset your password" : "Welcome back";
    const subtitle = isSignup
      ? "Start building a personalized AI stock research profile."
      : isForgot
        ? "Enter your email and Crius will send a prototype reset link."
        : "Log in to continue to your dashboard, watchlist, and saved AI screens.";

    target.innerHTML = `
      <section class="auth-shell">
        <div class="auth-copy section-block">
          <p class="eyebrow">Secure account access</p>
          <h1>${title}</h1>
          <p>${subtitle}</p>
          <div class="auth-benefits">
            <span>Saved watchlists</span>
            <span>AI stock reports</span>
            <span>Risk profile matching</span>
          </div>
        </div>
        <form class="auth-card glass-card">
          ${isSignup ? `<label>Full name<input type="text" placeholder="Arees Somani" /></label>` : ""}
          <label>Email<input type="email" placeholder="you@example.com" /></label>
          ${isForgot ? "" : `<label>Password<input type="password" placeholder="••••••••" /></label>`}
          ${isSignup ? `<label>Investor type<select><option>Balanced growth</option><option>Dividend income</option><option>Aggressive growth</option><option>Low-risk compounder</option></select></label>` : ""}
          <button class="button primary" type="button">${isSignup ? "Create account" : isForgot ? "Send reset link" : "Login"}</button>
          <div class="auth-links">
            ${isSignup ? `<a href="login.html">Already have an account?</a>` : `<a href="forgot-password.html">Forgot password?</a><a href="signup.html">Create account</a>`}
          </div>
          <p class="ai-disclaimer">Prototype only. This form is visual and does not send credentials anywhere yet.</p>
        </form>
      </section>
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
