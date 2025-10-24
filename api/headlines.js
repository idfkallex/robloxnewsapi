const fetch = require("node-fetch");

let cachedText = null;
let lastFetch = 0;

module.exports = async (req, res) => {
  const API_KEY = 'pub_09540b50aa7241d9bd88599b20f29112';
  const now = Date.now();

  if (!cachedText || now - lastFetch > 480000) {
    try {
      // "top" & "world" categories give global event summaries — guaranteed to work on free plan
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en&category=world`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Take top 3 most important pieces and show title + summary
        const top3 = data.results.slice(0, 3).map(a => {
          const title = a.title?.trim() || "No title";
          const desc = a.description?.trim() || "No summary available.";
          return `${title} — ${desc}`;
        });
        cachedText = top3.join("\n\n");
      } else {
        cachedText = "No global news summaries available.";
      }

      lastFetch = now;
    } catch (err) {
      console.error("Proxy error:", err);
      cachedText = "Error retrieving global event summaries.";
    }
  }

  // Respond as plain text
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(cachedText);
};
