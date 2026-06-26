const data = window.CRIUS_DATA;
const favoriteKey = "criusFavoriteTickers";

function getFavorites() {
  const saved = localStorage.getItem(favoriteKey);
  return saved ? JSON.parse(saved) : ["AAPL", "NVDA", "MSFT", "AMZN"];
}

function saveFavorites(favorites) {
  localStorage.setItem(favoriteKey, JSON.stringify(favorites));
}

function toggleFavorite(ticker) {
  const favorites = getFavorites();
  const nextFavorites = favorites.includes(ticker)
    ? favorites.filter((item) => item !== ticker)
    : [...favorites, ticker];

  saveFavorites(nextFavorites);
  renderCurrentPage();
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function formatChange(change) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function scoreClass(score) {
  if (score >= 82) {
    return "positive";
  }

  if (score >= 72) {
    return "watch";
  }

  return "risk";
}

function createFavoriteButton(stock) {
  const favorites = getFavorites();
  const button = document.createElement("button");
  const isFavorite = favorites.includes(stock.ticker);

  button.className = isFavorite ? "favorite-button active" : "favorite-button";
  button.type = "button";
  button.textContent = isFavorite ? "Added" : "Add";
  button.setAttribute("aria-label", `${isFavorite ? "Remove" : "Add"} ${stock.ticker} watchlist favorite`);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(stock.ticker);
  });

  return button;
}

function stockCard(stock, options = {}) {
  const card = document.createElement(options.linkCard ? "a" : "article");
  card.className = "stock-card glass-card";

  if (options.linkCard) {
    card.href = options.linkTo || "pages/watchlist.html";
  }

  card.innerHTML = `
    <div class="card-topline">
      <div>
        <strong>${stock.ticker}</strong>
        <span>${stock.company}</span>
      </div>
      <span class="score-pill ${scoreClass(stock.score)}">${stock.score}</span>
    </div>
    <div class="price-row">
      <span>${formatPrice(stock.price)}</span>
      <strong class="${stock.change >= 0 ? "positive-text" : "negative-text"}">${formatChange(stock.change)}</strong>
    </div>
    <p>${stock.status}</p>
    <div class="tag-row">
      <span>${stock.rating}</span>
      <span>${stock.risk} risk</span>
    </div>
  `;

  return card;
}

function trendingCard(stock, linkTo) {
  const card = document.createElement("article");
  card.className = "trend-card glass-card";

  const link = document.createElement("a");
  link.href = linkTo;
  link.className = "trend-link";
  link.innerHTML = `
    <div class="card-topline">
      <div>
        <strong>${stock.ticker}</strong>
        <span>${stock.company}</span>
      </div>
      <span class="trend-tag">${stock.tag}</span>
    </div>
    <h3>${stock.theme}</h3>
    <p>${stock.reason}</p>
    <div class="risk-meter">
      <span>Growth/risk profile</span>
      <strong>${stock.rating} / ${stock.risk}</strong>
    </div>
  `;

  card.appendChild(link);
  card.appendChild(createFavoriteButton(stock));
  return card;
}

function articleCard(article, expandable = false) {
  const card = document.createElement("article");
  card.className = "article-card glass-card";

  card.innerHTML = `
    <div class="article-meta">
      <span>${article.source}</span>
      <span>${article.category}</span>
    </div>
    <h3>${article.headline}</h3>
    <p>${article.summary}</p>
    <div class="ticker-row">${article.tickers.map((ticker) => `<span>${ticker}</span>`).join("")}</div>
    <div class="impact-line">
      <span>Expected impact</span>
      <strong>${article.impact}</strong>
    </div>
  `;

  if (expandable) {
    const more = document.createElement("p");
    const button = document.createElement("button");

    more.className = "expanded-summary";
    more.textContent = article.expanded;
    more.hidden = true;

    button.className = "read-more";
    button.type = "button";
    button.textContent = "Read more";
    button.addEventListener("click", () => {
      more.hidden = !more.hidden;
      button.textContent = more.hidden ? "Read more" : "Show less";
    });

    card.appendChild(more);
    card.appendChild(button);
  }

  return card;
}

function renderHome() {
  const snapshot = document.querySelector("#watchlistSnapshot");
  const trending = document.querySelector("#homeTrendingGrid");
  const articles = document.querySelector("#homeArticleGrid");

  if (snapshot) {
    snapshot.innerHTML = "";
    data.stocks.slice(0, 4).forEach((stock) => {
      snapshot.appendChild(stockCard(stock, { linkCard: true, linkTo: "pages/watchlist.html" }));
    });
  }

  if (trending) {
    trending.innerHTML = "";
    data.stocks.slice(1, 7).forEach((stock) => {
      trending.appendChild(trendingCard(stock, "pages/hot-stocks.html"));
    });
  }

  if (articles) {
    articles.innerHTML = "";
    data.articles.slice(0, 4).forEach((article) => {
      const link = document.createElement("a");
      link.href = "pages/articles.html";
      link.className = "article-link-card";
      link.appendChild(articleCard(article));
      articles.appendChild(link);
    });
  }
}

function renderWatchlist() {
  const table = document.querySelector("#watchlistTable");
  const search = document.querySelector("#watchlistSearch");
  const count = document.querySelector("#watchlistCount");
  const empty = document.querySelector("#watchlistEmpty");

  if (!table || !search) {
    return;
  }

  const searchTerm = search.value.trim().toLowerCase();
  const stocks = data.stocks.filter((stock) => {
    return stock.ticker.toLowerCase().includes(searchTerm) || stock.company.toLowerCase().includes(searchTerm);
  });

  table.innerHTML = "";
  stocks.forEach((stock) => {
    const row = document.createElement("article");
    row.className = "table-row glass-card";
    row.innerHTML = `
      <div>
        <strong>${stock.ticker}</strong>
        <span>${stock.company}</span>
      </div>
      <div>
        <strong>${formatPrice(stock.price)}</strong>
        <span class="${stock.change >= 0 ? "positive-text" : "negative-text"}">${formatChange(stock.change)}</span>
      </div>
      <div>
        <strong>${stock.score}/100</strong>
        <span>${stock.rating}</span>
      </div>
      <div>
        <strong>${stock.risk}</strong>
        <span>${stock.status}</span>
      </div>
    `;
    table.appendChild(row);
  });

  count.textContent = `Showing ${stocks.length} ${stocks.length === 1 ? "stock" : "stocks"}`;
  empty.hidden = stocks.length > 0;
}

function renderHotStocks() {
  const grid = document.querySelector("#hotStocksGrid");
  const search = document.querySelector("#hotStocksSearch");
  const count = document.querySelector("#hotStocksCount");
  const empty = document.querySelector("#hotStocksEmpty");

  if (!grid || !search) {
    return;
  }

  const searchTerm = search.value.trim().toLowerCase();
  const stocks = data.stocks.filter((stock) => {
    const target = `${stock.ticker} ${stock.company} ${stock.theme} ${stock.reason}`.toLowerCase();
    return target.includes(searchTerm);
  });

  grid.innerHTML = "";
  stocks.forEach((stock) => grid.appendChild(trendingCard(stock, "hot-stocks.html")));

  count.textContent = `Showing ${stocks.length} ${stocks.length === 1 ? "trend" : "trends"}`;
  empty.hidden = stocks.length > 0;
}

function renderArticles() {
  const list = document.querySelector("#articlesList");

  if (!list) {
    return;
  }

  list.innerHTML = "";
  data.articles.forEach((article, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "ranked-article";
    wrapper.innerHTML = `<span class="rank-number">${String(index + 1).padStart(2, "0")}</span>`;
    wrapper.appendChild(articleCard(article, true));
    list.appendChild(wrapper);
  });
}

function renderCurrentPage() {
  const page = document.body.dataset.page;

  if (page === "home") {
    renderHome();
  }

  if (page === "watchlist") {
    renderWatchlist();
  }

  if (page === "hot-stocks") {
    renderHotStocks();
  }

  if (page === "articles") {
    renderArticles();
  }
}

function bindSearch(inputId, renderFunction) {
  const input = document.querySelector(inputId);

  if (input) {
    input.addEventListener("input", renderFunction);
  }
}

bindSearch("#watchlistSearch", renderWatchlist);
bindSearch("#hotStocksSearch", renderHotStocks);
renderCurrentPage();
