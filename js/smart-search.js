window.CriusSmartSearch = {
  step: 0,
  answers: {},

  render() {
    const data = window.CRIUS_DATA;
    const question = data.smartQuestions[this.step];
    const target = document.querySelector("#smartWizard");
    const progress = document.querySelector("#wizardProgress");
    const results = document.querySelector("#smartResults");
    if (!target || !question) return;

    progress.style.width = `${((this.step + 1) / data.smartQuestions.length) * 100}%`;
    target.innerHTML = `
      <p class="eyebrow">Question ${this.step + 1} of ${data.smartQuestions.length}</p>
      <h2>${question.question}</h2>
      <div class="choice-grid">
        ${question.options.map((option) => `<button class="choice-button ${this.answers[question.id] === option ? "active" : ""}" type="button" data-answer="${option}">${option}</button>`).join("")}
      </div>
      <div class="wizard-actions">
        <button class="button secondary" type="button" data-wizard="skip">Skip</button>
        <button class="button primary" type="button" data-wizard="next">${this.step === data.smartQuestions.length - 1 ? "Generate matches" : "Next"}</button>
      </div>
    `;

    target.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        this.answers[question.id] = button.dataset.answer;
        this.render();
      });
    });

    target.querySelector("[data-wizard='skip']").addEventListener("click", () => this.next());
    target.querySelector("[data-wizard='next']").addEventListener("click", () => this.next());

    if (results && this.step < data.smartQuestions.length - 1) {
      results.innerHTML = "";
    }
  },

  next() {
    if (this.step < window.CRIUS_DATA.smartQuestions.length - 1) {
      this.step += 1;
      this.render();
      return;
    }
    this.showResults();
  },

  showResults() {
    const ui = window.CriusUI;
    const results = document.querySelector("#smartResults");
    const matches = window.CRIUS_DATA.stocks
      .filter((stock) => stock.confidence >= 76)
      .slice(0, 6);

    results.innerHTML = matches.map((stock) => `
      <article class="scenario-card glass-card">
        <div class="card-topline">
          <div><strong>${stock.ticker}</strong><span class="muted">${stock.company}</span></div>
          <span class="confidence-pill ${ui.confidenceClass(stock.confidence)}">${stock.confidence}% confidence</span>
        </div>
        <p><strong>Current:</strong> ${ui.formatPrice(stock.price)} · <strong>Projected:</strong> ${ui.formatPrice(stock.projectedPrice)}</p>
        <p>${stock.outlook}</p>
        <details>
          <summary>AI explanation</summary>
          <p>${stock.aiTag}. Trend note: ${stock.reason}</p>
        </details>
        ${ui.favoriteButton(stock)}
        <p class="ai-disclaimer">AI-generated. Not financial advice.</p>
      </article>
    `).join("");
    ui.bindCommonActions();
  }
};
