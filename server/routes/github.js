const express = require('express');

const router = express.Router();
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

router.get('/latest', async (req, res) => {
  const owner = process.env.GITHUB_USERNAME;
  const repository = process.env.GITHUB_REPOSITORY || 'dinolibre';

  if (!owner) {
    return res.status(500).json({
      error: 'GITHUB_USERNAME is not configured',
    });
  }

  const cacheKey = `${owner}/${repository}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const url = new URL(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits`
    );
    url.searchParams.set('per_page', '1');

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'dinolibre-website',
      },
    });
    const commits = await response.json();

    if (!response.ok || !Array.isArray(commits) || !commits[0]) {
      console.error('GitHub API error:', commits);

      if (cached) {
        return res.json(cached.data);
      }

      return res.status(response.status || 502).json({
        error: 'Failed to fetch the latest GitHub commit',
      });
    }

    const commit = commits[0];
    const data = {
      repository: cacheKey,
      message: commit.commit.message.split('\n')[0],
      date: commit.commit.author?.date || commit.commit.committer?.date,
      url: commit.html_url,
    };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return res.json(data);
  } catch (error) {
    console.error('GitHub route error:', error);

    if (cached) {
      return res.json(cached.data);
    }

    return res.status(502).json({
      error: 'Unable to reach GitHub',
    });
  }
});

module.exports = router;