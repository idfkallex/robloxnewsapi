const fetch = require("node-fetch");

let cachedText = null;
let lastFetch = 0;

// Words to censor (case-insensitive)
const bannedWords = [
  "kill",
  "killed",
  "killing",
  "died",
  "death",
  "blood",
  "drugs",
  "drug",
  "murder",
  "suicide",
  "weapon",
  "war"
];

function censorText(text) {
  let result = text;
  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    result = result.replace(regex, (match) => "*".repeat(match.length));
  }
  return result;
}

module.exports = async (req, res) => {
  const API_KEY = 'pub_09540b50aa7241d9bd88599b20f29112';
  const now = Date.now();

  if (!cachedText || now - lastFetch > 480000) {
    try {
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en&category=world`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const top3 = data.results.slice(0, 3).map(a => {
          const title = censorText(a.title?.trim() || "No title");
          const desc = censorText(a.description?.trim() || "No summary available.");
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

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(cachedText);
};
