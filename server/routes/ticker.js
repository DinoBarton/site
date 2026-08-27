const express = require('express');

const router = express.Router();
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

router.get("/:ticker", async (req, res) => {
  const ticker = req.params.ticker.trim().toUpperCase();
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "POLYGON_API_KEY is not configured"
    });
  }

  if (!/^[A-Z.-]{1,10}$/.test(ticker)) {
    return res.status(400).json({
      error: "Invalid ticker symbol"
    });
  }

  try {
    const cached = cache.get(ticker);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    const url = new URL(
      `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(ticker)}/prev`
    );

    url.searchParams.set("adjusted", "true");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("Polygon API error:", data);

      if (cached) {
        return res.json(cached.data);
      }

      return res.status(response.status).json({
        error: data.error || data.message || "Failed to fetch stock data"
      });
    }

    cache.set(ticker, { data, timestamp: Date.now() });
    return res.json(data);
  } catch (error) {
    console.error("Ticker route error:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
});

module.exports = router;
           