window.CriusSmartSearch = {
  step: 0,
  answers: {
    investCurrency: "CAD",
    targetCurrency: "CAD",
    market: "Any",
    sectors: [],
    volatility: "Any",
    avoidWatchlist: false
  },

  questions: [
    {
      id: "investmentGoal",
      eyebrow: "First set of questions",
      title: "Investment goal",
      required: true,
      type: "money-goal"
    },
    {
      id: "timeframe",
      eyebrow: "Second questions",
      title: "Minimum time frame",
      required: true,
      type: "choice",
      options: ["< 1 year (short-term)", "1-3 years", "3-5 years", "5-10 years", "10+ years (long-term)"]
    },
    {
      id: "market",
      eyebrow: "Market preference",
      title: "Market",
      required: false,
      type: "market"
    },
    {
      id: "sectors",
      eyebrow: "Sector interest",
      title: "Sector(s) of interest",
      required: false,
      type: "sectors"
    },
    {
      id: "volatility",
      eyebrow: "Volatility preference",
      title: "Current volatility",
      required: false,
      type: "choice",
      options: ["Low", "Medium", "High", "Any"]
    },
    {
      id: "filters",
      eyebrow: "Final filter",
      title: "Watchlist filter",
      required: false,
      type: "filters"
    }
  ],

  currencies: ["CAD", "USD", "EUR", "GBP", "JPY"],
  markets: ["Any", "USA", "Canada", "Japan", "United Kingdom", "Europe", "China", "India", "Australia", "Other"],
  sectorOptions: [
    "Technology",
    "Healthcare",
    "Financials",
    "Consumer Discretionary",
    "Consumer Staples",
    "Industrials",
    "Energy",
    "Materials",
    "Utilities",
    "Real Estate",
    "Communication Services"
  ],

  render() {
    const question = this.questions[this.step];
    const target = document.querySelector("#smartWizard");
    const progress = document.querySelector("#wizardProgress");
    const results = document.querySelector("#smartResults");
    if (!target || !question) return;

    progress.style.width = `${((this.step + 1) / this.questions.length) * 100}%`;
    target.innerHTML = `
      <p class="eyebrow">${question.eyebrow} ${question.required ? "· Required" : "· Optional"}</p>
      <h2>${question.title}</h2>
      ${this.renderQuestion(question)}
      <p class="form-error" id="smartSearchError" hidden>Please complete the required fields before continuing.</p>
      <div class="wizard-actions">
        <button class="button secondary" type="button" data-wizard="back" ${this.step === 0 ? "disabled" : ""}>Back</button>
        <div class="wizard-action-group">
          ${question.required ? "" : `<button class="button secondary" type="button" data-wizard="skip">Skip</button>`}
          <button class="button primary" type="button" data-wizard="next">${this.step === this.questions.length - 1 ? "Generate matches" : "Next"}</button>
        </div>
      </div>
    `;

    this.bindQuestion(question, target);
    target.querySelector("[data-wizard='back']")?.addEventListener("click", () => this.back());
    target.querySelector("[data-wizard='skip']")?.addEventListener("click", () => this.skip());
    target.querySelector("[data-wizard='next']")?.addEventListener("click", () => this.next());

    if (results && this.step < this.questions.length - 1) {
      results.innerHTML = "";
    }
  },

  renderQuestion(question) {
    if (question.type === "money-goal") {
      return `
        <div class="smart-input-grid">
          <label class="smart-field">
            <span>How much you want to invest <strong>*</strong></span>
            <div class="money-row">
              <input type="number" min="0" step="1" inputmode="decimal" id="investAmount" placeholder="Example: 700" value="${this.answers.investAmount || ""}" />
              <select id="investCurrency">${this.currencies.map((currency) => `<option ${this.answers.investCurrency === currency ? "selected" : ""}>${currency}</option>`).join("")}</select>
            </div>
          </label>
          <label class="smart-field">
            <span>How much you want to end with <strong>*</strong></span>
            <div class="money-row">
              <input type="number" min="0" step="1" inputmode="decimal" id="targetAmount" placeholder="Example: 1000" value="${this.answers.targetAmount || ""}" />
              <select id="targetCurrency">${this.currencies.map((currency) => `<option ${this.answers.targetCurrency === currency ? "selected" : ""}>${currency}</option>`).join("")}</select>
            </div>
          </label>
        </div>
      `;
    }

    if (question.type === "choice") {
      const selected = this.answers[question.id] || (question.id === "volatility" ? "Any" : "");
      return `
        <div class="choice-grid ${question.options.length > 4 ? "choice-grid-wide" : ""}">
          ${question.options.map((option) => `<button class="choice-button ${selected === option ? "active" : ""}" type="button" data-answer="${option}">${option}</button>`).join("")}
        </div>
      `;
    }

    if (question.type === "market") {
      return `
        <div class="smart-input-grid single">
          <label class="smart-field">
            <span>Choose a market</span>
            <select id="marketSelect">${this.markets.map((market) => `<option ${this.answers.market === market ? "selected" : ""}>${market}</option>`).join("")}</select>
          </label>
          <label class="smart-field" id="otherMarketWrap" ${this.answers.market === "Other" ? "" : "hidden"}>
            <span>Search or type another market</span>
            <input type="text" id="otherMarket" placeholder="Example: Germany, Brazil, South Korea" value="${this.answers.otherMarket || ""}" />
          </label>
        </div>
      `;
    }

    if (question.type === "sectors") {
      const selected = this.answers.sectors || [];
      return `
        <p class="muted smart-helper">Select one or more of the 11 main sectors, or type your own keywords.</p>
        <div class="choice-grid sector-choice-grid">
          ${this.sectorOptions.map((sector) => `<button class="choice-button ${selected.includes(sector) ? "active" : ""}" type="button" data-sector="${sector}">${sector}</button>`).join("")}
        </div>
        <label class="smart-field">
          <span>Custom sector keywords</span>
          <input type="text" id="sectorKeywords" placeholder="Example: AI, banks, uranium, semiconductors" value="${this.answers.sectorKeywords || ""}" />
        </label>
      `;
    }

    if (question.type === "filters") {
      return `
        <label class="smart-check-row">
          <input type="checkbox" id="avoidWatchlist" ${this.answers.avoidWatchlist ? "checked" : ""} />
          <span>Avoid stocks already in my watchlist</span>
        </label>
        <div class="smart-summary glass-card">
          <p class="eyebrow">Current search</p>
          <p>${this.summaryText()}</p>
        </div>
      `;
    }

    return "";
  },

  bindQuestion(question, target) {
    if (question.type === "money-goal") {
      ["investAmount", "targetAmount", "investCurrency", "targetCurrency"].forEach((id) => {
        target.querySelector(`#${id}`)?.addEventListener("input", (event) => {
          this.answers[id] = event.target.value;
        });
        target.querySelector(`#${id}`)?.addEventListener("change", (event) => {
          this.answers[id] = event.target.value;
        });
      });
    }

    if (question.type === "choice") {
      target.querySelectorAll("[data-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          this.answers[question.id] = button.dataset.answer;
          this.render();
        });
      });
    }

    if (question.type === "market") {
      const select = target.querySelector("#marketSelect");
      const otherInput = target.querySelector("#otherMarket");
      select?.addEventListener("change", (event) => {
        this.answers.market = event.target.value;
        this.render();
      });
      otherInput?.addEventListener("input", (event) => {
        this.answers.otherMarket = event.target.value;
      });
    }

    if (question.type === "sectors") {
      target.querySelectorAll("[data-sector]").forEach((button) => {
        button.addEventListener("click", () => {
          const sector = button.dataset.sector;
          const current = new Set(this.answers.sectors || []);
          current.has(sector) ? current.delete(sector) : current.add(sector);
          this.answers.sectors = [...current];
          this.render();
        });
      });
      target.querySelector("#sectorKeywords")?.addEventListener("input", (event) => {
        this.answers.sectorKeywords = event.target.value;
      });
    }

    if (question.type === "filters") {
      target.querySelector("#avoidWatchlist")?.addEventListener("change", (event) => {
        this.answers.avoidWatchlist = event.target.checked;
      });
    }
  },

  validate(question) {
    if (!question.required) return true;
    if (question.type === "money-goal") {
      return Number(this.answers.investAmount) > 0 && Number(this.answers.targetAmount) > 0;
    }
    return Boolean(this.answers[question.id]);
  },

  next() {
    const question = this.questions[this.step];
    const error = document.querySelector("#smartSearchError");
    if (!this.validate(question)) {
      if (error) error.hidden = false;
      return;
    }

    if (this.step < this.questions.length - 1) {
      this.step += 1;
      this.render();
      return;
    }
    this.showResults();
  },

  back() {
    if (this.step === 0) return;
    this.step -= 1;
    this.render();
  },

  skip() {
    if (this.step < this.questions.length - 1) {
      this.step += 1;
      this.render();
      return;
    }
    this.showResults();
  },

  summaryText() {
    const market = this.answers.market === "Other" ? (this.answers.otherMarket || "custom market") : this.answers.market;
    const sectors = [...(this.answers.sectors || []), this.answers.sectorKeywords].filter(Boolean).join(", ") || "any sector";
    return `${this.answers.investCurrency || "CAD"} ${this.answers.investAmount || "—"} aiming for ${this.answers.targetCurrency || "CAD"} ${this.answers.targetAmount || "—"}; ${this.answers.timeframe || "any time frame"}; ${market || "Any market"}; ${sectors}; ${this.answers.volatility || "Any"} volatility.`;
  },

  showResults() {
    const ui = window.CriusUI;
    const results = document.querySelector("#smartResults");
    if (!results) return;

    const favorites = this.answers.avoidWatchlist ? ui.getFavorites() : [];
    const volatility = (this.answers.volatility || "Any").toLowerCase();
    const selectedSectorText = [...(this.answers.sectors || []), this.answers.sectorKeywords]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const sectorAliases = {
      technology: ["technology", "semiconductors", "ai", "cloud", "software", "search"],
      healthcare: ["healthcare", "health"],
      financials: ["financial", "bank", "fintech"],
      "consumer discretionary": ["consumer", "commerce", "electric vehicles", "ev"],
      "consumer staples": ["staples", "food", "retail"],
      industrials: ["industrial", "manufacturing"],
      energy: ["energy", "oil", "gas", "renewable"],
      materials: ["materials", "mining", "uranium"],
      utilities: ["utilities", "power"],
      "real estate": ["real estate", "reit"],
      "communication services": ["communication", "advertising", "streaming", "media"]
    };

    let matches = window.CRIUS_DATA.stocks.filter((stock) => {
      const favoriteMatch = favorites.includes(stock.ticker);
      const volatilityMatch = volatility === "any" || stock.stats.volatility.toLowerCase() === volatility;
      const stockText = `${stock.sector} ${stock.company} ${stock.aiTag} ${stock.reason}`.toLowerCase();
      const sectorMatch = !selectedSectorText || Object.entries(sectorAliases).some(([sector, aliases]) => {
        return selectedSectorText.includes(sector) && aliases.some((alias) => stockText.includes(alias));
      }) || selectedSectorText.split(/[,\s]+/).some((word) => word.length > 2 && stockText.includes(word));
      return !favoriteMatch && volatilityMatch && sectorMatch;
    });

    if (!matches.length) {
      matches = window.CRIUS_DATA.stocks
        .filter((stock) => !favorites.includes(stock.ticker))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    } else {
      matches = matches.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
    }

    results.innerHTML = `
      <article class="scenario-card glass-card smart-result-summary">
        <p class="eyebrow">Search summary</p>
        <h3>Your AI Smart Search</h3>
        <p>${this.summaryText()}</p>
        <p class="ai-disclaimer">Educational prototype only. Not financial advice.</p>
      </article>
      ${matches.map((stock) => `
        <article class="scenario-card glass-card">
          <div class="card-topline">
            <div><strong>${stock.ticker}</strong><span class="muted">${stock.company}</span></div>
            <span class="confidence-pill ${ui.confidenceClass(stock.confidence)}">${stock.confidence}% confidence</span>
          </div>
          <p><strong>Current:</strong> ${ui.formatPrice(stock.price)} · <strong>Projected:</strong> ${ui.formatPrice(stock.projectedPrice)}</p>
          <p>${stock.outlook}</p>
          <details>
            <summary>AI explanation</summary>
            <p>${stock.aiTag}. Matched using your goal, time frame, sector, volatility, and watchlist filters.</p>
          </details>
          ${ui.favoriteButton(stock)}
          <p class="ai-disclaimer">AI-generated. Not financial advice.</p>
        </article>
      `).join("")}
    `;
    ui.bindCommonActions();
  }
};
