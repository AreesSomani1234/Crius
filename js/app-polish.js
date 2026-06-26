(() => {
  if (!window.CriusApp) return;

  Object.assign(window.CriusApp, {
    renderHotStocks() {
      const ui = window.CriusUI;
      const grid = document.querySelector("#hotStocksGrid");
      const count = document.querySelector("#hotStocksCount");
      const query = (document.querySelector("#hotStocksSearch")?.value || "").toLowerCase();
      const sector = document.querySelector("#sectorFilter")?.value || "All";
      const cap = document.querySelector("#capFilter")?.value || "All";
      const stocks = window.CRIUS_DATA.stocks
        .filter((stock) => {
          const textMatch = `${stock.ticker} ${stock.company} ${stock.sector} ${stock.aiTag}`.toLowerCase().includes(query);
          const sectorMatch = sector === "All" || stock.sector === sector;
          const capMatch = cap === "All" || stock.marketCap === cap;
          return textMatch && sectorMatch && capMatch;
        })
        .sort((a, b) => b.confidence - a.confidence);

      if (!grid) return;
      if (!stocks.length) {
        grid.innerHTML = `
          <div class="empty-state search-empty-state">
            <strong>No hot stocks found</strong>
            <p>Try All sectors, All market caps, or a broader search term like AI, cloud, or software.</p>
          </div>
        `;
        if (count) count.textContent = "No matching AI-curated stocks";
        return;
      }

      grid.innerHTML = stocks.map((stock) => ui.trendCard(stock, `stock-detail.html?ticker=${stock.ticker}`)).join("");
      if (count) count.textContent = `Showing ${stocks.length} AI-curated stocks, ranked by confidence`;
    },

    renderMarkets() {
      const target = document.querySelector("#marketsContent");
      if (!target) return;

      const groups = [
        { name: "Technology Pulse", filter: ["Semiconductors", "Cloud Software", "AI Software", "Search and Cloud"], note: "AI infrastructure and cloud remain the strongest themes in this prototype." },
        { name: "Consumer Pulse", filter: ["Consumer Technology", "Digital Advertising", "Streaming Media", "Cloud and Commerce"], note: "Consumer platforms are ranked by cash-flow quality, ad demand, and engagement trends." },
        { name: "Speculative Growth", filter: ["Electric Vehicles", "AI Software"], note: "Higher volatility ideas need stricter position sizing and clearer scenario planning." }
      ];

      target.innerHTML = groups.map((group) => {
        const stocks = window.CRIUS_DATA.stocks.filter((stock) => group.filter.includes(stock.sector));
        const avgScore = Math.round(stocks.reduce((sum, stock) => sum + stock.score, 0) / stocks.length);
        const tickers = stocks.map((stock) => stock.ticker).join(" · ");
        return `
          <article class="market-pulse-card glass-card">
            <p class="eyebrow">Mock market group</p>
            <h3>${group.name}</h3>
            <strong class="signal-score-small">${avgScore}</strong>
            <p>${group.note}</p>
            <div class="ticker-row">${tickers.split(" · ").map((ticker) => `<span class="ticker-pill">${ticker}</span>`).join("")}</div>
            <p class="ai-disclaimer">Prototype score. Not financial advice.</p>
          </article>
        `;
      }).join("");
    },

    renderCompare() {
      const target = document.querySelector("#compareContent");
      if (!target) return;

      const stocks = window.CRIUS_DATA.stocks.slice(0, 4);
      target.innerHTML = `
        <div class="compare-table glass-card">
          <div class="compare-row compare-heading">
            <span>Metric</span>
            ${stocks.map((stock) => `<strong>${stock.ticker}</strong>`).join("")}
          </div>
          <div class="compare-row">
            <span>Company</span>
            ${stocks.map((stock) => `<span>${stock.company}</span>`).join("")}
          </div>
          <div class="compare-row">
            <span>Crius Score</span>
            ${stocks.map((stock) => `<strong>${stock.score}/100</strong>`).join("")}
          </div>
          <div class="compare-row">
            <span>AI Confidence</span>
            ${stocks.map((stock) => `<span>${stock.confidence}%</span>`).join("")}
          </div>
          <div class="compare-row">
            <span>Risk</span>
            ${stocks.map((stock) => `<span>${stock.risk}</span>`).join("")}
          </div>
          <div class="compare-row">
            <span>Sector</span>
            ${stocks.map((stock) => `<span>${stock.sector}</span>`).join("")}
          </div>
          <div class="compare-row">
            <span>Thesis</span>
            ${stocks.map((stock) => `<span>${stock.aiTag}</span>`).join("")}
          </div>
        </div>
        <div class="grid-4 compare-cards">
          ${stocks.map((stock) => `
            <article class="scenario-card glass-card">
              <p class="eyebrow">${stock.sector}</p>
              <h3>${stock.ticker}</h3>
              <p>${stock.outlook}</p>
              <a class="text-link" href="stock-detail.html?ticker=${stock.ticker}">Open report</a>
            </article>
          `).join("")}
        </div>
      `;
    }
  });
})();
