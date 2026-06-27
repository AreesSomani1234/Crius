(() => {
  const data = () => window.CRIUS_DATA;
  const ui = () => window.CriusUI;

  function riskMix(stocks) {
    const order = { Low: 1, Medium: 2, High: 3 };
    if (!stocks.length) return "None";
    const avg = stocks.reduce((sum, stock) => sum + (order[stock.risk] || 2), 0) / stocks.length;
    if (avg < 1.5) return "Lower";
    if (avg < 2.35) return "Balanced";
    return "Aggressive";
  }

  function avg(list, key) {
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, item) => sum + item[key], 0) / list.length);
  }

  function ensureAfter(selector, id, html) {
    if (document.querySelector(`#${id}`)) return;
    const anchor = document.querySelector(selector);
    if (anchor) anchor.insertAdjacentHTML("afterend", html);
  }

  if (window.CriusWatchlist) {
    Object.assign(window.CriusWatchlist, {
      renderHome() {
        const store = data();
        const helpers = ui();
        const favorites = helpers.getFavorites();
        const favoriteStocks = store.stocks.filter((stock) => favorites.includes(stock.ticker));
        const topConfidence = [...store.stocks].sort((a, b) => b.confidence - a.confidence)[0];

        ensureAfter(".dashboard-hero", "homeInsightGrid", `
          <section class="home-insight-grid" id="homeInsightGrid">
            <a class="insight-card glass-card" href="pages/markets.html">
              <p class="eyebrow">Today&apos;s market pulse</p>
              <h3>AI infrastructure remains the strongest prototype theme.</h3>
              <span class="ticker-pill">Open Markets</span>
            </a>
            <a class="insight-card glass-card primary-insight" href="pages/smart-search.html">
              <p class="eyebrow">Continue Smart Search</p>
              <h3>Build a goal-based stock screen in under a minute.</h3>
              <span class="ticker-pill">Start matching</span>
            </a>
            <a class="insight-card glass-card" href="pages/watchlist.html">
              <p class="eyebrow">Watchlist summary</p>
              <h3>${favoriteStocks.length || 0} saved stocks</h3>
              <span class="ticker-pill">${riskMix(favoriteStocks)} risk mix</span>
            </a>
          </section>
        `);

        const carousel = document.querySelector("#watchlistCarousel");
        const hotPreview = document.querySelector("#hotPreviewGrid");
        const articles = document.querySelector("#articlePreviewGrid");
        const skeleton = document.querySelector("#watchlistSkeleton");
        const empty = document.querySelector("#watchlistEmpty");

        if (carousel) {
          const watchlist = favoriteStocks.length ? favoriteStocks.slice(0, 4) : store.stocks.slice(0, 4);
          if (skeleton) skeleton.hidden = true;
          if (empty) {
            empty.hidden = watchlist.length > 0;
            empty.textContent = "Your watchlist is empty. Start with Smart Search or Hot Stocks.";
          }
          carousel.innerHTML = watchlist.map((stock) => helpers.stockCard(stock, "pages/watchlist.html")).join("");
        }

        if (hotPreview) {
          hotPreview.innerHTML = store.stocks
            .filter((stock) => stock.ticker !== topConfidence.ticker)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 6)
            .map((stock) => helpers.trendCard(stock, `pages/stock-detail.html?ticker=${stock.ticker}`))
            .join("");
        }

        if (articles) {
          articles.innerHTML = store.articles.slice(0, 4).map((article) => `<a href="pages/articles.html">${helpers.articleCard(article)}</a>`).join("");
        }
      },

      renderPage() {
        const store = data();
        const helpers = ui();
        const favorites = helpers.getFavorites();
        const table = document.querySelector("#watchlistTable");
        const count = document.querySelector("#watchlistCount");
        const empty = document.querySelector("#watchlistEmpty");
        const discover = document.querySelector("#watchlistDiscover");
        const query = (document.querySelector("#watchlistSearch")?.value || "").toLowerCase();
        const favoriteStocks = store.stocks.filter((stock) => favorites.includes(stock.ticker));
        const stocks = favoriteStocks.filter((stock) => `${stock.ticker} ${stock.company} ${stock.sector}`.toLowerCase().includes(query));
        const best = [...favoriteStocks].sort((a, b) => b.score - a.score)[0];
        const riskiest = [...favoriteStocks].sort((a, b) => ({ High: 3, Medium: 2, Low: 1 }[b.risk] || 0) - ({ High: 3, Medium: 2, Low: 1 }[a.risk] || 0))[0];
        const topSector = favoriteStocks.length ? Object.entries(favoriteStocks.reduce((acc, stock) => {
          acc[stock.sector] = (acc[stock.sector] || 0) + 1;
          return acc;
        }, {})).sort((a, b) => b[1] - a[1])[0][0] : "None";

        ensureAfter("#watchlistCount", "watchlistMetrics", `<div class="watchlist-metrics" id="watchlistMetrics"></div>`);
        const metrics = document.querySelector("#watchlistMetrics");
        if (metrics) {
          metrics.innerHTML = `
            <article class="stat-card glass-card"><span>Saved Stocks</span><strong>${favoriteStocks.length}</strong></article>
            <article class="stat-card glass-card"><span>Best Stock</span><strong>${best ? best.ticker : "—"}</strong></article>
            <article class="stat-card glass-card"><span>Highest Risk</span><strong>${riskiest ? `${riskiest.ticker} · ${riskiest.risk}` : "—"}</strong></article>
            <article class="stat-card glass-card"><span>Top Sector</span><strong>${topSector}</strong></article>
            <article class="stat-card glass-card"><span>Risk Mix</span><strong>${riskMix(favoriteStocks)}</strong></article>
          `;
        }

        if (table) {
          table.innerHTML = stocks.map((stock) => `
            <a class="data-row watchlist-row glass-card" href="stock-detail.html?ticker=${stock.ticker}">
              <div class="watchlist-cell stock-identity"><strong>${stock.ticker}</strong><span>${stock.company}</span></div>
              <div class="watchlist-cell stock-price"><strong>${helpers.formatPrice(stock.price)}</strong><span class="${stock.changePercent >= 0 ? "positive-text" : "negative-text"}">${helpers.formatChange(stock.changePercent, stock.changeDollar)}</span></div>
              <div class="watchlist-cell stock-score"><strong>${stock.score}/100</strong><span>${stock.rating}</span></div>
              <div class="watchlist-cell stock-risk"><strong>${stock.risk}</strong><span>${stock.status}</span></div>
            </a>
          `).join("");
          if (count) count.textContent = favorites.length ? `Showing ${stocks.length} of ${favoriteStocks.length} saved stocks` : "Your watchlist is empty";
          if (empty) {
            empty.hidden = stocks.length > 0;
            empty.textContent = favorites.length ? "No saved stocks match your search. Try a broader ticker, company, or sector." : "Your watchlist is empty. Add stocks from Smart Search, Hot Stocks, or Stock Search.";
          }
        }

        const previous = document.querySelector("#previousSearches");
        if (previous) {
          previous.innerHTML = store.smartSearches.map((item) => `
            <article class="scenario-card glass-card"><p class="eyebrow">${item.created}</p><h3>${item.title}</h3><p>${item.summary}</p><div class="ticker-row">${item.tickers.map((ticker) => `<span class="ticker-pill">${ticker}</span>`).join("")}</div></article>
          `).join("");
        }

        if (discover) {
          const ideas = store.stocks.filter((stock) => !favorites.includes(stock.ticker)).sort((a, b) => b.confidence - a.confidence).slice(0, 4);
          discover.innerHTML = ideas.length ? ideas.map((stock) => helpers.trendCard(stock, `stock-detail.html?ticker=${stock.ticker}`)).join("") : `<p class="empty-state">You already have every prototype stock in your watchlist.</p>`;
        }
      }
    });
  }

  if (window.CriusSearch) {
    Object.assign(window.CriusSearch, {
      renderLanding() {
        const recent = document.querySelector("#recentSearches");
        const options = document.querySelector(".search-options");
        if (recent) recent.innerHTML = data().recentSearches.map((item) => `<span class="ticker-pill">${item}</span>`).join("");
        if (options) {
          options.innerHTML = `
            <a class="search-option glass-card primary-search-option" href="smart-search.html"><p class="eyebrow">Main AI feature</p><h2>AI Smart Search</h2><p>Tell Crius your investment goal, target amount, timeline, sectors, market, and volatility. Then get explained stock matches.</p><span class="ticker-pill">Goal-based matching</span></a>
            <a class="search-option glass-card" href="stock-search.html"><p class="eyebrow">Direct lookup</p><h2>Ticker Search</h2><p>Search a specific ticker or company and open a detailed AI stock report.</p><span class="ticker-pill">Fast report</span></a>
          `;
        }
      },

      renderStockSearch() {
        const helpers = ui();
        const query = (document.querySelector("#stockSearchInput")?.value || "").toLowerCase();
        const results = document.querySelector("#stockSearchResults");
        if (!results) return;
        const stocks = data().stocks.filter((stock) => `${stock.ticker} ${stock.company} ${stock.sector}`.toLowerCase().includes(query)).sort((a, b) => b.score - a.score);
        if (!stocks.length) {
          results.innerHTML = `<div class="empty-state search-empty-state"><strong>No stocks found</strong><p>Try a ticker like NVDA, a company like Microsoft, or a sector like semiconductors.</p><a class="button secondary" href="smart-search.html">Use Smart Search instead</a></div>`;
          return;
        }
        results.innerHTML = stocks.map((stock) => `
          <a class="lookup-card glass-card" href="stock-detail.html?ticker=${stock.ticker}">
            <div class="card-topline"><div><strong>${stock.ticker}</strong><span class="muted">${stock.company}</span></div><span class="score-pill ${helpers.scoreClass(stock.score)}">${stock.score}</span></div>
            <p>${stock.status}</p><div class="tag-row"><span class="tag-pill">${stock.sector}</span><span class="tag-pill">${helpers.formatPrice(stock.price)}</span><span class="tag-pill">${stock.risk} risk</span></div>
          </a>
        `).join("");
      }
    });
  }

  if (window.CriusApp) {
    Object.assign(window.CriusApp, {
      renderMarkets() {
        const target = document.querySelector("#marketsContent");
        if (!target) return;
        const groups = [
          { name: "USA Growth", market: "USA", filter: ["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL"], summary: "Large-cap technology and platform stocks carry the strongest prototype confidence." },
          { name: "AI Infrastructure", market: "Global", filter: ["NVDA", "AMD", "MSFT", "AMZN"], summary: "Compute, cloud, and chips remain the highest-conviction Crius theme." },
          { name: "Speculative Momentum", market: "USA", filter: ["TSLA", "PLTR", "AMD"], summary: "Higher volatility names need tighter risk controls and scenario planning." },
          { name: "Consumer Platforms", market: "USA", filter: ["AAPL", "AMZN", "META", "NFLX", "GOOGL"], summary: "Cash-flow quality, advertising strength, and engagement trends drive the score." }
        ];
        target.innerHTML = groups.map((group) => {
          const stocks = data().stocks.filter((stock) => group.filter.includes(stock.ticker));
          const top = [...stocks].sort((a, b) => b.confidence - a.confidence)[0];
          return `
            <article class="market-pulse-card glass-card">
              <p class="eyebrow">${group.market} market pulse</p>
              <h3>${group.name}</h3>
              <div class="market-stats"><span>Avg score <strong>${avg(stocks, "score")}/100</strong></span><span>Avg confidence <strong>${avg(stocks, "confidence")}%</strong></span><span>Top ticker <strong>${top?.ticker || "—"}</strong></span></div>
              <p>${group.summary}</p>
              <div class="ticker-row">${stocks.map((stock) => `<span class="ticker-pill">${stock.ticker}</span>`).join("")}</div>
              <p class="ai-disclaimer">Prototype market summary. Not financial advice.</p>
            </article>
          `;
        }).join("");
      },

      renderHotStocks() {
        const helpers = ui();
        const grid = document.querySelector("#hotStocksGrid");
        const count = document.querySelector("#hotStocksCount");
        const query = (document.querySelector("#hotStocksSearch")?.value || "").toLowerCase();
        const sector = document.querySelector("#sectorFilter")?.value || "All";
        const cap = document.querySelector("#capFilter")?.value || "All";
        const stocks = data().stocks.filter((stock) => {
          const textMatch = `${stock.ticker} ${stock.company} ${stock.sector} ${stock.aiTag}`.toLowerCase().includes(query);
          const sectorMatch = sector === "All" || stock.sector === sector;
          const capMatch = cap === "All" || stock.marketCap === cap;
          return textMatch && sectorMatch && capMatch;
        }).sort((a, b) => b.confidence - a.confidence);
        if (!grid) return;
        if (!stocks.length) {
          grid.innerHTML = `<div class="empty-state search-empty-state"><strong>No hot stocks found</strong><p>Try All sectors, All market caps, or a broader search term like AI, cloud, or software.</p></div>`;
          if (count) count.textContent = "No matching AI-curated stocks";
          return;
        }
        grid.innerHTML = stocks.map((stock) => helpers.trendCard(stock, `stock-detail.html?ticker=${stock.ticker}`)).join("");
        if (count) count.textContent = `Showing ${stocks.length} AI-curated stocks, ranked by confidence`;
      }
    });
  }
})();