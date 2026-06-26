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

  gradeClass(score) {
    if (score >= 84) return "high";
    if (score >= 72) return "medium";
    return "low";
  },

  scoreLabel(score) {
    if (score >= 84) return "Excellent";
    if (score >= 72) return "Constructive";
    if (score >= 62) return "Mixed";
    return "Speculative";
  },

  valuationGrade(stock) {
    const pe = Number.parseFloat(stock.stats.pe);
    if (pe <= 28) return { grade: "Attractive", score: 86, note: "Valuation looks reasonable relative to large-cap quality." };
    if (pe <= 42) return { grade: "Fair", score: 74, note: "Valuation is acceptable, but upside needs continued execution." };
    if (pe <= 58) return { grade: "Premium", score: 62, note: "Premium multiple means expectations are already high." };
    return { grade: "Expensive", score: 48, note: "Valuation risk is a major part of the thesis." };
  },

  growthGrade(stock) {
    const growth = Number.parseFloat(stock.stats.revenueGrowth);
    if (growth >= 25) return { grade: "Elite", score: 92, note: "Growth profile is well above a typical large-cap screen." };
    if (growth >= 12) return { grade: "Strong", score: 82, note: "Growth remains strong enough to support a constructive thesis." };
    if (growth >= 6) return { grade: "Steady", score: 70, note: "Growth is moderate and needs margin support." };
    return { grade: "Slow", score: 55, note: "Growth is muted, so valuation discipline matters more." };
  },

  riskGrade(stock) {
    const map = {
      Low: { grade: "Lower", score: 84, note: "Risk level is relatively contained for this watchlist." },
      Medium: { grade: "Moderate", score: 70, note: "Risk is acceptable but should be monitored around earnings and valuation." },
      High: { grade: "Elevated", score: 46, note: "Risk is high; position sizing and scenario planning matter." }
    };
    return map[stock.risk] || map.Medium;
  },

  dividendProfile(stock) {
    const dividendFriendly = ["AAPL", "MSFT", "NVDA", "META"];
    if (dividendFriendly.includes(stock.ticker)) {
      return "Dividend profile is secondary. This name is mainly scored for quality, cash flow, and growth rather than high yield.";
    }
    return "No meaningful dividend focus in this prototype. Crius treats this as a capital-appreciation idea, not an income stock.";
  },

  competitorSet(stock) {
    const sectorPeers = window.CRIUS_DATA.stocks
      .filter((item) => item.ticker !== stock.ticker && (item.sector === stock.sector || item.marketCap === stock.marketCap))
      .slice(0, 3);
    return sectorPeers.length ? sectorPeers : window.CRIUS_DATA.stocks.filter((item) => item.ticker !== stock.ticker).slice(0, 3);
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

  renderGradeCard(title, grade) {
    return `
      <article class="report-card glass-card">
        <div class="report-card-top">
          <span>${title}</span>
          <strong class="confidence-pill ${this.gradeClass(grade.score)}">${grade.grade}</strong>
        </div>
        <div class="mini-score"><span style="width:${grade.score}%"></span></div>
        <p>${grade.note}</p>
      </article>
    `;
  },

  renderDetail() {
    const ui = window.CriusUI;
    const stock = this.getSelectedStock();
    const detail = document.querySelector("#stockDetail");
    if (!detail) return;

    const valuation = this.valuationGrade(stock);
    const growth = this.growthGrade(stock);
    const risk = this.riskGrade(stock);
    const peers = this.competitorSet(stock);
    const finalVerdict = `${stock.ticker} receives a ${stock.score}/100 Crius score and a ${this.scoreLabel(stock.score).toLowerCase()} overall profile. The strongest positive signals are ${stock.bullish.slice(0, 2).join(" and ").toLowerCase()}, while the biggest watch item is ${stock.bearish[0].toLowerCase()}.`;

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
      <section class="section-block report-overview">
        <div>
          <p class="eyebrow">Company overview</p>
          <h2>${stock.company}</h2>
          <p>${stock.company} is shown as a ${stock.marketCap.toLowerCase()} ${stock.sector.toLowerCase()} stock in the Crius prototype. The current thesis centers on ${stock.reason.toLowerCase()}</p>
        </div>
        <div class="report-score-card glass-card">
          <span>Crius Score</span>
          <strong>${stock.score}/100</strong>
          <p>${this.scoreLabel(stock.score)} profile · ${stock.risk} risk</p>
        </div>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><h2>AI Score Breakdown</h2><p>Valuation, growth, risk, dividends, and thesis quality in one view.</p></div></div>
        <div class="report-grid">
          ${this.renderGradeCard("Valuation", valuation)}
          ${this.renderGradeCard("Growth", growth)}
          ${this.renderGradeCard("Risk", risk)}
          <article class="report-card glass-card">
            <div class="report-card-top"><span>Dividend Profile</span><strong class="confidence-pill medium">Secondary</strong></div>
            <p>${this.dividendProfile(stock)}</p>
          </article>
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
        <div class="section-heading"><div><h2>Competitor Comparison</h2><p>Nearby large-cap peers from the prototype universe.</p></div></div>
        <div class="competitor-grid">
          ${peers.map((peer) => `
            <a class="competitor-card glass-card" href="stock-detail.html?ticker=${peer.ticker}">
              <div><strong>${peer.ticker}</strong><span>${peer.company}</span></div>
              <div><strong>${peer.score}/100</strong><span>${peer.risk} risk</span></div>
            </a>
          `).join("")}
        </div>
      </section>
      <section class="section-block final-verdict">
        <p class="eyebrow">Final AI verdict</p>
        <h2>${this.scoreLabel(stock.score)} Watchlist Candidate</h2>
        <p>${finalVerdict}</p>
        <p class="ai-disclaimer"><strong>Educational only:</strong> This prototype report is not financial advice, does not know your full financial situation, and should not be treated as a buy/sell recommendation.</p>
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
  },

  bindChartControls() {
    document.querySelectorAll(".chart-tab").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".chart-tab").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }
};
