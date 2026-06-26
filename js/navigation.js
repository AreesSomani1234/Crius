window.CriusNavigation = {
  links: [
    { label: "Home", href: "index.html", page: "home" },
    { label: "Search", href: "pages/search.html", page: "search" },
    { label: "Watchlist", href: "pages/watchlist.html", page: "watchlist" },
    { label: "Hot Stocks", href: "pages/hot-stocks.html", page: "hot-stocks" },
    { label: "Articles", href: "pages/articles.html", page: "articles" },
    { label: "Profile", href: "pages/profile.html", page: "profile" }
  ],
  resolveHref(href) {
    const root = document.body.dataset.root || ".";
    if (root === ".") return href;
    if (href === "index.html") return "../index.html";
    return href.replace("pages/", "");
  },

  render() {
    const page = document.body.dataset.page;
    const header = document.querySelector("#siteHeader");
    const footer = document.querySelector("#siteFooter");
    const user = window.CRIUS_DATA.user;

    if (header) {
      header.innerHTML = `
        <a class="brand" href="${this.resolveHref("index.html")}" aria-label="Crius home">
          <span class="brand-mark">C</span>
          <span>Crius</span>
        </a>
        <nav class="top-nav" aria-label="Main navigation">
          ${this.links.map((link) => `<a class="${link.page === page ? "active" : ""}" href="${this.resolveHref(link.href)}">${link.label}</a>`).join("")}
        </nav>
        <div class="header-actions">
          <a class="icon-button optional" href="${this.resolveHref("pages/search.html")}" aria-label="Search shortcut">S</a>
          <button class="icon-button optional" type="button" aria-label="Notifications">N</button>
          <a class="icon-button" href="${this.resolveHref("pages/profile.html")}" aria-label="Profile shortcut">${user.name.charAt(0)}</a>
        </div>
      `;
    }

    if (footer) {
      footer.innerHTML = `
        <p><strong>Disclaimer:</strong> Crius provides educational stock research only and does not provide financial advice. Prototype scores, AI takes, projections, and charts are illustrative mock outputs and should not be used as investment recommendations.</p>
      `;
    }
  }
};
