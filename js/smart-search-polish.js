(() => {
  if (!window.CriusSmartSearch) return;

  Object.assign(window.CriusSmartSearch, {
    goalInsight() {
      const invest = Number(this.answers.investAmount || 0);
      const target = Number(this.answers.targetAmount || 0);
      if (!invest || !target) return "Goal fit is based on your saved investment inputs.";
      const requiredGain = ((target - invest) / invest) * 100;
      if (requiredGain <= 10) return "Your target is conservative, so Crius prioritizes quality and lower-risk confidence.";
      if (requiredGain <= 35) return "Your target needs balanced growth, so Crius looks for quality names with visible upside.";
      return "Your target is ambitious, so Crius includes higher-upside ideas while flagging risk clearly.";
    },

    matchReason(stock) {
      const reasons = [];
      const timeframe = this.answers.timeframe || "your selected time frame";
      const volatility = this.answers.volatility || "Any";
      const sectors = [...(this.answers.sectors || []), this.answers.sectorKeywords].filter(Boolean).join(", ");

      reasons.push(`${stock.ticker} fits the ${timeframe} horizon because its thesis is tied to ${stock.reason.toLowerCase()}`);
      if (sectors) reasons.push(`It was matched against your sector interests: ${sectors}.`);
      if (volatility !== "Any") reasons.push(`It also matches your ${volatility.toLowerCase()} volatility preference.`);
      if (this.answers.avoidWatchlist) reasons.push("Crius excluded stocks already saved in your watchlist before ranking this result.");
      reasons.push(this.goalInsight());

      return reasons.join(" ");
    },

    noMatchCard() {
      return `
        <article class="scenario-card glass-card smart-result-summary">
          <p class="eyebrow">No exact match</p>
          <h3>Crius found fallback ideas</h3>
          <p>Your filters were narrow, so these are the highest-confidence prototype stocks after applying the watchlist filter.</p>
          <p class="ai-disclaimer">Educational prototype only. Not financial advice.</p>
        </article>
      `;
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

      let exactMatch = true;
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
        exactMatch = false;
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
          <p>${this.goalInsight()}</p>
          <p class="ai-disclaimer">Educational prototype only. Crius does not recommend buying or selling securities.</p>
        </article>
        ${exactMatch ? "" : this.noMatchCard()}
        ${matches.map((stock) => `
          <article class="scenario-card glass-card">
            <div class="card-topline">
              <div><strong>${stock.ticker}</strong><span class="muted">${stock.company}</span></div>
              <span class="confidence-pill ${ui.confidenceClass(stock.confidence)}">${stock.confidence}% confidence</span>
            </div>
            <p><strong>Current:</strong> ${ui.formatPrice(stock.price)} · <strong>Projected:</strong> ${ui.formatPrice(stock.projectedPrice)}</p>
            <p>${stock.outlook}</p>
            <details open>
              <summary>Why this matched</summary>
              <p>${this.matchReason(stock)}</p>
            </details>
            ${ui.favoriteButton(stock)}
            <p class="ai-disclaimer">AI-generated. Not financial advice.</p>
          </article>
        `).join("")}
      `;
      ui.bindCommonActions();
    }
  });
})();
