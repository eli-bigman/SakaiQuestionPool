// api/fetchPage.js
export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    try {
      // Using built-in fetch (Node 18+ on Vercel)
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch URL" });
      }
      const html = await response.text();
      res.status(200).json({ html });
    } catch (err) {
      res.status(500).json({ error: "Error fetching URL", details: err.toString() });
    }
  }
  