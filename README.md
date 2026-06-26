# Crius

Crius is an early frontend prototype for an AI-powered investing platform. It is designed as a premium stock intelligence dashboard for AI recommendations, smart stock matching, watchlist research, stock vetting, and AI-simplified market articles.

## Current Status

Crius is currently a static frontend prototype only. It uses realistic mock data and does not include a backend, APIs, authentication, API keys, databases, or paid services.

Every AI-style prediction or recommendation in the interface is mock educational content and includes the product disclaimer: AI-generated. Not financial advice.

## Architecture

```text
Crius/
  index.html
  pages/
    search.html
    stock-search.html
    smart-search.html
    watchlist.html
    hot-stocks.html
    articles.html
    stock-detail.html
    profile.html
    compare.html
    markets.html
  components/
    navbar.html
    footer.html
    stock-card.html
    article-card.html
    hot-stock-card.html
    watchlist-card.html
    modal.html
  css/
    styles.css
    variables.css
    layout.css
    components.css
    pages.css
    animations.css
    responsive.css
  js/
    app.js
    navigation.js
    ui.js
    mockData.js
    watchlist.js
    search.js
    smart-search.js
    stocks.js
    articles.js
  assets/
    logos/
    icons/
    images/
    fonts/
```

The project is intentionally modular even though it is still plain HTML, CSS, and JavaScript. Mock data is separated from UI rendering so backend APIs can later replace `js/mockData.js` without rewriting the pages.

## Pages Included

- `index.html` - dashboard homepage with hero, watchlist carousel, hot stocks, top articles, and persistent navigation
- `pages/search.html` - search landing page with Smart Search and Stock Search entry points
- `pages/stock-search.html` - regular stock search with mock autocomplete-style results
- `pages/smart-search.html` - skippable multi-step AI matching wizard with mock recommendations
- `pages/watchlist.html` - full watchlist, previous smart searches, and lookup shortcuts
- `pages/hot-stocks.html` - filtered AI-curated stock momentum page with favorites
- `pages/articles.html` - AI-simplified article feed with quotes, outlook, and expandable summaries
- `pages/stock-detail.html` - stock information, mock chart, statistics, AI Take, and prior AI scenarios
- `pages/profile.html` - premium SaaS profile/settings prototype
- `pages/compare.html` - placeholder comparison dashboard prepared for future side-by-side vetting
- `pages/markets.html` - placeholder market pulse dashboard prepared for future market data

The prototype includes mock data for:

- AAPL
- NVDA
- MSFT
- TSLA
- AMZN
- META
- AMD
- PLTR
- GOOGL
- NFLX

## How To Run

Use the VS Code Live Server extension:

1. Open this folder in VS Code.
2. Right-click `index.html`.
3. Choose `Open with Live Server`.

You can also open `index.html` directly in your browser because the project uses plain HTML, CSS, and JavaScript.

## Tech Used

- HTML
- CSS
- JavaScript

## Technical Decisions

- Plain static frontend for easy local editing and beginner-friendly development.
- Modular CSS files for variables, layout, components, page-specific views, animations, and responsive behavior.
- Modular JavaScript files for navigation, reusable UI rendering, mock data, search, smart search, watchlist, stock details, and articles.
- Reusable card renderers in `js/ui.js` so watchlist, hot stocks, search results, and article cards stay consistent.
- Mock local favorite state uses `localStorage` to simulate adding stocks to a watchlist.
- Pages are structured so backend data can later replace mock data with minimal UI changes.

## Future Roadmap

- Add real API integration for stock prices, financial statements, news, and analyst data.
- Add authentication and user profiles.
- Persist watchlists, favorite sectors, risk tolerance, and smart search history.
- Build real AI summarization and recommendation services.
- Add charts with a production charting library.
- Add compare workflows, alerts, notifications, billing, privacy controls, and support flows.

## Disclaimer

Crius currently shows educational mock ratings, AI summaries, and projections only. It is not financial advice, and it does not connect to a real stock API.
