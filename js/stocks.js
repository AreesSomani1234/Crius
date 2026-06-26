window.CriusStocks = {
  getSelectedStock() {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get("ticker") || "NVDA";
    return window.CRIUS_DATA.stocks.find((stock) => stock.ticker === ticker) || window.CRIUS_DATA.stocks[0];
  },

  renderDetail() {
    const ui = window.CriusUI;
    const stock = this.getSelectedStock();
    const detail = document.querySelector("#stockDetail");
    if (!detail) return;

    detail.innerHTML = `
      <section class="section-block">
        <div class="stock-detail-header">
          <div>
            <p class="eyebrow">${stock.sector}</p>
            <h1>${stock.ticker} · ${stock.company}</h1>
            <p>${stock.status}</p>
          </div>
          <div>
            <div class="price-row"><span>${ui.formatPrice(stock.price)}</span><strong class="${stock.changePercent >= 0 ? "positive-text" : "negative-text"}">${ui.formatChange(stock.changePercent, stock.changeDollar)}</strong></div>
            ${ui.favoriteButton(stock)}
          </div>
        </div>
      </section>
      <div class="stock-detail-layout">
        <section class="section-block chart-card">
          <div class="section-heading"><div><h2>Price Chart</h2><p>Mock seven-point trend for prototype planning.</p></div></div>
          <svg class="chart-surface" viewBox="0 0 600 250" preserveAspectRatio="none">
            <polyline points="${stock.sparkline.map((point, index) => `${(index / (stock.sparkline.length - 1)) * 600},${220 - ((point - Math.min(...stock.sparkline)) / (Math.max(...stock.sparkline) - Math.min(...stock.sparkline) || 1)) * 180}`).join(" ")}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></polyline>
          </svg>
        </section>
        <aside class="section-block">
          <h2>Statistics</h2>
          <div class="stack">
            ${Object.entries(stock.stats).map(([key, value]) => `<div class="stat-card glass-card"><span>${key}</span><strong>${value}</strong></div>`).join("")}
          </div>
        </aside>
      </div>
      <section class="section-block">
        <div class="section-heading"><div><h2>AI Take</h2><p>Bullish and bearish signals with forward-looking commentary.</p></div></div>
        <div class="grid-3">
          <article class="scenario-card glass-card"><h3>Bullish Signals</h3><ul>${stock.bullish.map((item) => `<li>${item}</li>`).join("")}</ul></article>
          <article class="scenario-card glass-card"><h3>Bearish Signals</h3><ul>${stock.bearish.map((item) => `<li>${item}</li>`).join("")}</ul></article>
          <article class="scenario-card glass-card"><h3>AI Confidence</h3><p class="signal-score-small">${stock.confidence}%</p><p>${stock.outlook}</p><p class="ai-disclaimer">AI-generated. Not financial advice.</p></article>
        </div>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><h2>Previous AI Scenarios</h2><p>Mock history of saved opinions and projections.</p></div></div>
        <div class="scenario-timeline">
          <div class="timeline-item"><strong>Today</strong><p>Projected ${ui.formatPrice(stock.projectedPrice)} with ${stock.confidence}% confidence.</p></div>
          <div class="timeline-item"><strong>Last week</strong><p>Risk profile reviewed after sector momentum changed.</p></div>
          <div class="timeline-item"><strong>Last month</strong><p>Initial watchlist thesis created from smart search.</p></div>
        </div>
      </section>
    `;
  }
};
