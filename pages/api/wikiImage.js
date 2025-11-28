export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.query;

    // Validate query parameter
    if (!query || query.trim() === "" || query === "Untitled") {
      return res.status(400).json({ error: "Invalid query parameter" });
    }

    // 1. Search Wikipedia for the query
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json`
    );

    if (!searchRes.ok) {
      return res.status(500).json({ error: "Failed to search Wikipedia" });
    }

    const searchData = await searchRes.json();

    if (
      !searchData.query ||
      !searchData.query.search ||
      !searchData.query.search.length
    ) {
      return res.status(404).json({ error: "No results found", image: null });
    }

    // Get first search result title
    const pageTitle = searchData.query.search[0].title;

    // 2. Get the page summary (with image)
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        pageTitle
      )}`
    );

    if (!summaryRes.ok) {
      // If summary fails, return success but with no image
      return res.status(200).json({
        title: pageTitle,
        image: null,
      });
    }

    const summaryData = await summaryRes.json();

    res.status(200).json({
      title: pageTitle,
      image: summaryData.thumbnail ? summaryData.thumbnail.source : null,
    });
  } catch (err) {
    console.error("WikiImage API error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch from Wikipedia", image: null });
  }
}
