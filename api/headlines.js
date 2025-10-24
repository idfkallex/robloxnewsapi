const fetch = require("node-fetch");

let cachedData = null;
let lastFetch = 0;

module.exports = async (req, res) => {
  const API_KEY = 'pub_09540b50aa7241d9bd88599b20f29112';
  const now = Date.now();
  if (!cachedData || now - lastFetch > 480000) {
    try {
      // simple, safe parameters to avoid UnsupportedParameter
      const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&category=top&page_size=3`;
      const response = await fetch(url);
      const data = await response.json();
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
