window.CriusWatchlist = {
  renderHome() {
    const data = window.CRIUS_DATA;
    const ui = window.CriusUI;
    const carousel = document.querySelector("#watchlistCarousel");
    const hotPreview = document.querySelector("#hotPreviewGrid");
    const articles = document.querySelector("#articlePreviewGrid");
    const skeleton = document.querySelector("#watchlistSkeleton");
    const empty = document.querySelector("#watchlistEmpty");

    if (carousel) {
      const favorites = ui.getFavorites();
      const favoriteStocks = data.stocks.filter((stock) => favorites.includes(stock.ticker)).slice(0, 4);
      const backupStocks = data.stocks.filter((stock) => !favorites.includes(stock.ticker)).slice(0, 4);
      const watchlist = [...favoriteStocks, ...backupStocks].slice(0, 4);

      skeleton.hidden = true;
      empty.hidden = watchlist.length > 0;
      carousel.innerHTML = watchlist.map((stock) => ui.stockCard(stock, "pages/watchlist.html")).join("");
    }

    if (hotPreview) {
      hotPreview.innerHTML = data.stocks.slice(1, 7).map((stock) => ui.trendCard(stock, "pages/hot-stocks.html")).join("");
    }

    if (articles) {
      articles.innerHTML = data.articles.slice(0, 4).map((article) => `<a href="pages/articles.html">${ui.articleCard(article)}</a>`).join("");
    }
  },

  renderPage() {
    const data = window.CRIUS_DATA;
    const ui = window.CriusUI;
    const table = document.querySelector("#watchlistTable");
    const count = document.querySelector("#watchlistCount");
    const empty = document.querySelector("#watchlistEmpty");
    const discover = document.querySelector("#watchlistDiscover");
    const query = (document.querySelector("#watchlistSearch")?.value || "").toLowerCase();
    const favorites = ui.getFavorites();
    const favoriteStocks = data.stocks.filter((stock) => favorites.includes(stock.ticker));
    const stocks = favoriteStocks.filter((stock) => `${stock.ticker} ${stock.company} ${stock.sector}`.toLowerCase().includes(query));

    if (table) {
      table.innerHTML = stocks.map((stock) => `
        <a class="data-row watchlist-row glass-card" href="stock-detail.html?ticker=${stock.ticker}">
          <div class="watchlist-cell stock-identity"><strong>${stock.ticker}</strong><span>${stock.company}</span></div>
          <div class="watchlist-cell stock-price"><strong>${ui.formatPrice(stock.price)}</strong><span class="${stock.changePercent >= 0 ? "positive-text" : "negative-text"}">${ui.formatChange(stock.changePercent, stock.changeDollar)}</span></div>
          <div class="watchlist-cell stock-score"><strong>${stock.score}/100</strong><span>${stock.rating}</span></div>
          <div class="watchlist-cell stock-risk"><strong>${stock.risk}</strong><span>${stock.status}</span></div>
        </a>
      `).join("");
      count.textContent = favorites.length ? `Showing ${stocks.length} of ${favoriteStocks.length} watchlist stocks` : "Your watchlist is empty";
      empty.hidden = stocks.length > 0;
      empty.textContent = favorites.length ? "No watchlist stocks match your search." : "Your watchlist is empty. Add stocks from Smart Search, Hot Stocks, or Stock Search.";
    }

    const previous = document.querySelector("#previousSearches");
    if (previous) {
      previous.innerHTML = data.smartSearches.map((item) => `
        <article class="scenario-card glass-card">
          <p class="eyebrow">${item.created}</p>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <div class="ticker-row">${item.tickers.map((ticker) => `<span class="ticker-pill">${ticker}</span>`).join("")}</div>
        </article>
      `).join("");
    }

    if (discover) {
      const ideas = data.stocks.filter((stock) => !favorites.includes(stock.ticker)).slice(0, 4);
      discover.innerHTML = ideas.length
        ? ideas.map((stock) => ui.trendCard(stock, `stock-detail.html?ticker=${stock.ticker}`)).join("")
        : `<p class="empty-state">You already have every prototype stock in your watchlist.</p>`;
    }
  }
};