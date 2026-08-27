import { useEffect, useState } from "react";

export default function Ticker() {
  const [stocks, setStocks] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");

  // Polygon's basic plan rate-limits individual aggregate requests.
  // Keep this list within that limit instead of making the whole tape fail.
  const tickers = ["AAPL", "MSFT", "GOOGL", "AMZN"];

  useEffect(() => {
    async function fetchStocks() {
      try {
        const responses = await Promise.allSettled(
          tickers.map(async (ticker) => {
            const response = await fetch(
              `http://localhost:5000/api/ticker/${ticker}`
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch ${ticker}`);
            }

            const data = await response.json();
            const result = data.results?.[0];
            const change =
              typeof result?.c === "number" && typeof result?.o === "number"
                ? result.c - result.o
                : undefined;

            return {
              symbol: ticker,
              price: result?.c,
              open: result?.o,
              high: result?.h,
              low: result?.l,
              volume: result?.v,
              change,
              changePercent:
                change !== undefined && result.o !== 0
                  ? (change / result.o) * 100
                  : undefined,
            };
          })
        );

        const successfulResults = responses
          .filter((response) => response.status === "fulfilled")
          .map((response) => response.value);

        if (successfulResults.length === 0) {
          throw new Error("No stock data could be loaded. Polygon may be rate limiting requests.");
        }

        setStocks(successfulResults);

        responses
          .filter((response) => response.status === "rejected")
          .forEach((response) => console.warn(response.reason));
      } catch (error) {
        console.error(error);
      }
    }

    fetchStocks();
  }, []);

  const selectedStock = stocks.find(
    (stock) => stock.symbol === selectedTicker
  );

  const formatPrice = (value) =>
    typeof value === "number" ? `$${value.toFixed(2)}` : "—";

  const tickerItems = [...stocks, ...stocks];

  return (
    <div>
      <div className="ticker" aria-label="Market ticker">
        <div className="ticker-track">
          {tickerItems.map((stock, index) => {
            const hasChange = typeof stock.changePercent === "number";
            const isPositive = hasChange && stock.change >= 0;

            return (
              <button
                key={`${stock.symbol}-${index}`}
                className="ticker-item"
                onClick={() => setSelectedTicker(stock.symbol)}
                aria-pressed={stock.symbol === selectedTicker}
                type="button"
              >
                <span className="ticker-symbol">{stock.symbol}</span>
                <span className="ticker-price">{formatPrice(stock.price)}</span>
                <span className={`ticker-change ${hasChange ? (isPositive ? "positive" : "negative") : "unavailable"}`}>
                  {hasChange
                    ? `${isPositive ? "▲" : "▼"} ${formatPrice(Math.abs(stock.change))} (${stock.changePercent.toFixed(2)}%)`
                    : "Change unavailable"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
