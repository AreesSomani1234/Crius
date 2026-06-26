window.CriusStocks = {
  getSelectedStock() {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get("ticker") || "NVDA";
    return window.CRIUS_DATA.stocks.find((stock) => stock.ticker === ticker) || window.CRIUS_DATA.stocks[0];
  },

  prettyStatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());
  },

  renderChart(stock) {
    const points = stock.sparkline;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 640;
    const height = 320;
    const padLeft = 64;
    const padRight = 34;
    const padTop = 34;
    const padBottom = 54;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const coords = points.map((point, index) => {
      const x = padLeft + (index / (points.length - 1)) * plotW;
      const y = padTop + plotH - ((point - min) / range) * plotH;
      return { x, y, point };
    });
    const line = coords.map(({ x, y }) => `${x},${y}`).join(" ");
    const area = `${padLeft},${height - padBottom} ${line} ${width - padRight},${height - padBottom}`;
    const yTicks = [max, min + range * 0.5, min];
    const grid = yTicks.map((value) => {
      const y = padTop + plotH - ((value - min) / range) * plotH;
      return `
        <line class="chart-grid-line" x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}"></line>
        <text class="chart-axis-label y-axis-label" x="${padLeft - 12}" y="${y + 4}">$${value.toFixed(0)}</text>
      `;
    }).join("");
    const xLabels = [
      { label: "Start", index: 0 },
      { label: "Mid", index: Math.floor((coords.length - 1) / 2) },
      { label: "Now", index: coords.length - 1 }
    ].map(({ label, index }) => `<text class="chart-axis-label x-axis-label" x="${coords[index].x}" y="${height - 18}">${label}</text>`).join("");
    const labels = coords.map(({ x, y, point }, index) => {
      const label = index === coords.length - 1 ? "Now" : `Point ${index + 1}`;
      const tooltipWidth = 108;
      const boxX = Math.min(Math.max(x - tooltipWidth / 2, padLeft), width - padRight - tooltipWidth);
      const boxY = Math.max(y - 44, padTop + 6);
      return `
        <g class="chart-point" tabindex="0">
          <circle class="chart-hit-area" cx="${x}" cy="${y}" r="19"></circle>
          <circle class="chart-dot" cx="${x}" cy="${y}" r="6"></circle>
          <g class="chart-tooltip-group">
            <text class="chart-tooltip" x="${boxX + 10}" y="${boxY + 20}">${label}: $${point.toFixed(2)}</text>
          </g>
        </g>
      `;
    }).join("");

    return `
      <div class="chart-toolbar">
        <div class="chart-tabs" aria-label="Chart range options">
          <button class="chart-tab" type="button">1D</button>
          <button class="chart-tab" type="button">1W</button>
          <button class="chart-tab active" type="button">1M</button>
          <button class="chart-tab" type="button">1Y</button>
        </div>
        <div class="chart-change ${stock.changePercent >= 0 ? "positive-text" : "negative-text"}">${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%</div>
      </div>
      <svg class="chart-surface interactive-chart" viewBox="0 0 ${width} ${height}" aria-label="${stock.ticker} mock price trend chart">
        <defs>
          <linearGradient id="chartLineGradient-${stock.ticker}" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="var(--blue)"></stop>
            <stop offset="100%" stop-color="var(--green)"></stop>
          </linearGradient>
          <linearGradient id="chartAreaGradient-${stock.ticker}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="rgba(52, 226, 138, 0.24)"></stop>
            <stop offset="100%" stop-color="rgba(52, 226, 138, 0)"></stop>
          </linearGradient>
        </defs>
        ${grid}
        <text class="chart-axis-title y-axis-title" x="18" y="${height / 2}" transform="rotate(-90 18 ${height / 2})">Price</text>
        <text class="chart-axis-title x-axis-title" x="${width / 2}" y="${height - 4}">Mock time range</text>
        ${xLabels}
        <polygon class="chart-area" points="${area}" fill="url(#chartAreaGradient-${stock.ticker})"></polygon>
        <polyline class="chart-line" points="${line}" fill="none" stroke="url(#chartLineGradient-${stock.ticker})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${labels}
      </svg>
      <div class="chart-stats-row">
        <span>Low <strong>$${min.toFixed(2)}</strong></span>
        <span>High <strong>$${max.toFixed(2)}</strong></span>
        <span>Projected <strong>$${stock.projectedPrice.toFixed(2)}</strong></span>
      </div>
    `;
  },

  bindChartControls() {
    document.querySelectorAll(".chart-tab").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".chart-tab").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
    });
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
          <div class="section-heading"><div><h2>Price Chart</h2><p>Interactive mock trend using prototype data. Real market data can be plugged in later.</p></div></div>
          ${this.renderChart(stock)}
        </section>
        <aside class="section-block">
          <h2>Statistics</h2>
          <div class="stack">
            ${Object.entries(stock.stats).map(([key, value]) => `<div class="stat-card glass-card"><span>${this.prettyStatLabel(key)}</span><strong>${value}</strong></div>`).join("")}
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
    this.bindChartControls();
  }
};
