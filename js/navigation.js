window.CriusNavigation = {
  links: [
    { label: "Home", href: "index.html", page: "home" },
    { label: "Search", href: "pages/search.html", page: "search" },
    { label: "Watchlist", href: "pages/watchlist.html", page: "watchlist" },
    { label: "Hot Stocks", href: "pages/hot-stocks.html", page: "hot-stocks" },
    { label: "Articles", href: "pages/articles.html", page: "articles" },
    { label: "Profile", href: "pages/profile.html", page: "profile" }
  ],
  bottomLinks: [
    { label: "Home", icon: "H", href: "index.html", page: "home" },
    { label: "Search", icon: "S", href: "pages/search.html", page: "search" },
    { label: "Compare", icon: "C", href: "pages/compare.html", page: "compare" },
    { label: "Markets", icon: "M", href: "pages/markets.html", page: "markets" },
    { label: "Profile", icon: "P", href: "pages/profile.html", page: "profile" }
  ],

  resolveHref(href) {
    const root = document.body.dataset.root || ".";
    if (root === "." || href.startsWith("index.html")) return href;
    return href.replace("pages/", "").replace("index.html", "../index.html");
  },

  render() {
    const page = document.body.dataset.page;
    const header = document.querySelector("#siteHeader");
    const bottom = document.querySelector("#bottomNav");
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
          <a class="icon-button optional" href="${this.resolveHref("pages/search.html")}" aria-label="Search shortcut">⌕</a>
          <button class="icon-button optional" type="button" aria-label="Notifications">•</button>
          <a class="icon-button" href="${this.resolveHref("pages/profile.html")}" aria-label="Profile shortcut">${user.name.charAt(0)}</a>
        </div>
      `;
    }

    if (bottom) {
      bottom.innerHTML = this.bottomLinks.map((link) => `
        <a class="${link.page === page ? "active" : ""}" href="${this.resolveHref(link.href)}">
          <span>${link.icon}</span>
          ${link.label}
        </a>
      `).join("");
    }

    if (footer) {
      footer.innerHTML = "<p>Crius is an educational frontend prototype. AI-generated outputs are not financial advice.</p>";
    }
  }
};
