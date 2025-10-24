const fetch = require("node-fetch");

let cachedData = null;
let lastFetch = 0;

module.exports = async (req, res) => {
  const API_KEY = 'pub_09540b50aa7241d9bd88599b20f29112';
  const now = Date.now();

  // Only refresh every 8 minutes
  if (!cachedData || now - lastFetch > 480000) {
    try {
      // This one works even on free tier — no unsupported parameters
      const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&page=1`;
      const response = await fetch(url);
      const data = await response.json();

      // Limit to only top 3 headlines manually
      if (data.results) {
        data.results = data.results.slice(0, 3);
      }

      cachedData = data;
      lastFetch = now;
    } catch (error) {
      console.error('Proxy Error:', error);
      cachedData = { status: "error", results: { message: "Server Error" } };
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(cachedData);
};
