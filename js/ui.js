window.CriusUI = {
  formatPrice(price) {
    return `$${price.toFixed(2)}`;
  },

  formatChange(percent, dollars) {
    const percentSign = percent >= 0 ? "+" : "";
    const dollarSign = dollars >= 0 ? "+" : "-";
    return `${percentSign}${percent.toFixed(2)}% (${dollarSign}$${Math.abs(dollars).toFixed(2)})`;
  },

  scoreClass(score) {
    if (score >= 82) return "positive";
    if (score >= 72) return "watch";
    return "risk";
  },

  confidenceClass(confidence) {
    if (confidence >= 84) return "high";
    if (confidence >= 74) return "medium";
    return "low";
  },

  getFavorites() {
    const saved = localStorage.getItem("criusFavoriteTickers");
    return saved ? JSON.parse(saved) : ["AAPL", "NVDA", "MSFT", "AMZN"];
  },

  saveFavorites(favorites) {
    localStorage.setItem("criusFavoriteTickers", JSON.stringify(favorites));
  },

  toggleFavorite(ticker) {
    const favorites = this.getFavorites();
    const next = favorites.includes(ticker)
      ? favorites.filter((item) => item !== ticker)
      : [...favorites, ticker];
    this.saveFavorites(next);
    window.CriusApp.render();
  },

  sparkline(points) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const coords = points.map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 36 - ((point - min) / range) * 30;
      return `${x},${y}`;
    });

    return `
      <svg class="sparkline" viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${coords.join(" ")}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
    `;
  },

  favoriteButton(stock) {
    const favorites = this.getFavorites();
    const active = favorites.includes(stock.ticker);
    return `<button class="favorite-button ${active ? "active" : ""}" type="button" data-favorite="${stock.ticker}">${active ? "Added" : "Add to watchlist"}</button>`;
  },

  stockCard(stock, link = "pages/watchlist.html") {
    const changeClass = stock.changePercent >= 0 ? "positive-text" : "negative-text";
    return `
      <a class="stock-card glass-card" href="${link}">
        <div class="card-topline">
          <div>
            <strong>${stock.ticker}</strong>
            <span class="muted">${stock.company}</span>
          </div>
          <span class="score-pill ${this.scoreClass(stock.score)}">${stock.score}</span>
        </div>
        <div class="price-row">
          <span>${this.formatPrice(stock.price)}</span>
          <strong class="${changeClass}">${this.formatChange(stock.changePercent, stock.changeDollar)}</strong>
        </div>
        ${this.sparkline(stock.sparkline)}
        <p>${stock.status}</p>
        <div class="tag-row">
          <span class="tag-pill">${stock.rating}</span>
          <span class="tag-pill">${stock.risk} risk</span>
        </div>
      </a>
    `;
  },

  trendCard(stock, link = "hot-stocks.html") {
    return `
      <article class="trend-card glass-card">
        <a href="${link}">
          <div class="card-topline">
            <div>
              <strong>${stock.ticker}</strong>
              <span class="muted">${stock.company}</span>
            </div>
            <span class="confidence-pill ${this.confidenceClass(stock.confidence)}">${stock.confidence}% AI</span>
          </div>
          <h3>${stock.aiTag}</h3>
          <p>${stock.reason}</p>
          <div class="tag-row">
            <span class="tag-pill">${stock.sector}</span>
            <span class="tag-pill">${stock.risk} risk</span>
          </div>
        </a>
        ${this.favoriteButton(stock)}
        <p class="ai-disclaimer">AI-generated. Not financial advice.</p>
      </article>
    `;
  },

  articleCard(article, expandable = false) {
    return `
      <article class="article-card glass-card">
        <div class="article-meta">
          <span>${article.source}</span>
          <span>${article.category}</span>
        </div>
        <h3>${article.headline}</h3>
        <p>${article.summary}</p>
        <div class="ticker-row">${article.tickers.map((ticker) => `<span class="ticker-pill">${ticker}</span>`).join("")}</div>
        <div class="impact-line">
          <span>AI Outlook</span>
          <strong>${article.outlook}</strong>
        </div>
        <blockquote class="muted">"${article.quote}"</blockquote>
        ${expandable ? `<p class="expanded-summary" hidden>${article.expanded}</p><button class="read-more" type="button">Read more</button>` : ""}
        <p class="ai-disclaimer">AI-generated. Not financial advice.</p>
      </article>
    `;
  },

  bindCommonActions() {
    document.querySelectorAll("[data-favorite]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggleFavorite(button.dataset.favorite);
      });
    });

    document.querySelectorAll(".read-more").forEach((button) => {
      button.addEventListener("click", () => {
        const summary = button.previousElementSibling;
        summary.hidden = !summary.hidden;
        button.textContent = summary.hidden ? "Read more" : "Show less";
      });
    });
  }
};
