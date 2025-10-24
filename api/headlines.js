const fetch = require("node-fetch");

let cachedData = null;
let lastFetch = 0;

module.exports = async (req, res) => {
  const API_KEY = 'pub_09540b50aa7241d9bd88599b20f29112';
  const now = Date.now();

  // Only ask NewsData.io every 8 minutes
  if (!cachedData || now - lastFetch > 480000) {
    try {
      // This version works with free tier — queries for all "top" headlines safely
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en`;
      const response = await fetch(url);
      const data = await response.json();

      // Keep only the first 3 articles
      if (data.results) {
        data.results = data.results.slice(0, 3);
      }

      cachedData = data;
      lastFetch = now;
    } catch (error) {
      console.error('Proxy Error:', error);
      cachedData = {
        status: "error",
        results: { message: "Unable to fetch data" }
      };
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(cachedData);
};
