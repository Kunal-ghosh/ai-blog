
export default async function handler(req, res) {
    try {
      const { query } = req.query;
  
      // 1. Search Wikipedia for the query
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          query
        )}&format=json`
      );
      const searchData = await searchRes.json();
  
      if (!searchData.query.search.length) {
        return res.status(404).json({ error: "No results found" });
      }
  
      // Get first search result title
      const pageTitle = searchData.query.search[0].title;
  
      // 2. Get the page summary (with image)
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          pageTitle
        )}`
      );
      const summaryData = await summaryRes.json();
  
      res.status(200).json({
        title: pageTitle,
        image: summaryData.thumbnail ? summaryData.thumbnail.source : null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch from Wikipedia" });
    }
  }
  



