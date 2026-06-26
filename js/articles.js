window.CriusArticles = {
  renderPage() {
    const list = document.querySelector("#articlesList");
    if (!list) return;
    const ui = window.CriusUI;
    list.innerHTML = window.CRIUS_DATA.articles.map((article, index) => `
      <div class="data-row glass-card">
        <strong>${String(index + 1).padStart(2, "0")}</strong>
        <div>${ui.articleCard(article, true)}</div>
      </div>
    `).join("");
  }
};
