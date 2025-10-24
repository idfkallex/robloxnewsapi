const fetch = require("node-fetch");

let cachedText = null;
let lastFetch = 0;

module.exports = async (req, res) => {
  const API_KEY = 'pub_09540b50aa7241d9bd88599b20f29112';
  const now = Date.now();

  if (!cachedText || now - lastFetch > 480000) {
    try {
      // Get top/important English news
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en&category=top`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Select top 3 headlines and convert to plain text
        const top3 = data.results.slice(0, 3).map(a => a.title.trim());
        cachedText = top3.join("\n");
      } else {
        cachedText = "No headlines available.";
      }

      lastFetch = now;
    } catch (err) {
      console.error("Proxy error:", err);
      cachedText = "Error retrieving headlines.";
    }
  }

  // Respond as plain text instead of JSON
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(cachedText);
};
