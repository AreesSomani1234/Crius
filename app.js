const stocks = [
  {
    ticker: "AAPL",
    company: "Apple Inc.",
    score: 88,
    rating: "Strong",
    risk: "Low",
    explanation: "Strong mock fundamentals with balanced risk and steady momentum.",
    breakdown: {
      momentum: 91,
      stability: 84,
      growth: 89
    }
  },
  {
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    score: 92,
    rating: "Strong",
    risk: "Medium",
    explanation: "High mock growth profile with strong momentum and elevated volatility.",
    breakdown: {
      momentum: 96,
      stability: 78,
      growth: 98
    }
  },
  {
    ticker: "MSFT",
    company: "Microsoft Corporation",
    score: 86,
    rating: "Strong",
    risk: "Low",
    explanation: "Durable mock business quality with stable score inputs and broad strength.",
    breakdown: {
      momentum: 83,
      stability: 90,
      growth: 85
    }
  },
  {
    ticker: "TSLA",
    company: "Tesla, Inc.",
    score: 64,
    rating: "Risky",
    risk: "High",
    explanation: "Mixed mock score because of higher risk and less predictable stability.",
    breakdown: {
      momentum: 72,
      stability: 48,
      growth: 75
    }
  }
];

const watchlist = document.querySelector("#watchlist");
const searchInput = document.querySelector("#stockSearch");
const emptyState = document.querySelector("#emptyState");
const stockCount = document.querySelector("#stockCount");
const navButtons = document.querySelectorAll(".nav-button");

const featuredTicker = document.querySelector("#featuredTicker");
const featuredCompany = document.querySelector("#featuredCompany");
const featuredRating = document.querySelector("#featuredRating");
const featuredScore = document.querySelector("#featuredScore");
const featuredExplanation = document.querySelector("#featuredExplanation");
const featuredRisk = document.querySelector("#featuredRisk");
const scoreRing = document.querySelector("#scoreRing");
const scoreRingText = document.querySelector("#scoreRingText");
const breakdownTicker = document.querySelector("#breakdownTicker");
const momentumScore = document.querySelector("#momentumScore");
const stabilityScore = document.querySelector("#stabilityScore");
const growthScore = document.querySelector("#growthScore");

let selectedTicker = "AAPL";

function getScoreColor(score) {
  if (score >= 80) {
    return "var(--green)";
  }

  if (score >= 70) {
    return "var(--yellow)";
  }

  return "var(--red)";
}

function updateFeaturedStock(stock) {
  selectedTicker = stock.ticker;

  featuredTicker.textContent = stock.ticker;
  featuredCompany.textContent = stock.company;
  featuredRating.textContent = stock.rating;
  featuredRating.className = `rating-badge ${stock.rating.toLowerCase()}`;
  featuredScore.textContent = stock.score;
  featuredExplanation.textContent = stock.explanation;
  featuredRisk.textContent = stock.risk;

  const scoreColor = getScoreColor(stock.score);
  scoreRing.style.background = `conic-gradient(${scoreColor} ${stock.score}%, rgba(255, 255, 255, 0.1) 0)`;
  scoreRingText.textContent = stock.score;
  scoreRingText.style.color = scoreColor;

  breakdownTicker.textContent = stock.ticker;
  momentumScore.textContent = stock.breakdown.momentum;
  stabilityScore.textContent = stock.breakdown.stability;
  growthScore.textContent = stock.breakdown.growth;

  renderWatchlist();
}

function createStockRow(stock) {
  const button = document.createElement("button");
  button.className = stock.ticker === selectedTicker ? "stock-row active" : "stock-row";
  button.type = "button";
  button.setAttribute("aria-label", `Show ${stock.company} rating`);

  button.innerHTML = `
    <div class="stock-meta">
      <strong>${stock.ticker}</strong>
      <span>${stock.company}</span>
    </div>
    <div class="row-score">${stock.score}</div>
  `;

  button.addEventListener("click", () => updateFeaturedStock(stock));
  return button;
}

function getFilteredStocks() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return stocks.filter((stock) => {
    return (
      stock.ticker.toLowerCase().includes(searchTerm) ||
      stock.company.toLowerCase().includes(searchTerm)
    );
  });
}

function renderWatchlist() {
  const filteredStocks = getFilteredStocks();

  watchlist.innerHTML = "";
  filteredStocks.forEach((stock) => {
    watchlist.appendChild(createStockRow(stock));
  });

  emptyState.hidden = filteredStocks.length > 0;
  stockCount.textContent = `${filteredStocks.length} ${
    filteredStocks.length === 1 ? "stock" : "stocks"
  }`;
}

searchInput.addEventListener("input", renderWatchlist);

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

updateFeaturedStock(stocks[0]);
