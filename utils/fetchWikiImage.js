/**
 * Fetches a Wikipedia image for a given query
 * This function is used at build time in getStaticProps
 * @param {string} query - The search query
 * @returns {Promise<string|null>} - The image URL or null if not found
 */
export async function fetchWikiImage(query) {
  // Validate query parameter
  if (!query || query.trim() === "" || query === "Untitled") {
    return null;
  }

  try {
    // 1. Search Wikipedia for the query
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json`
    );

    if (!searchRes.ok) {
      return null;
    }

    const searchData = await searchRes.json();

    if (
      !searchData.query ||
      !searchData.query.search ||
      !searchData.query.search.length
    ) {
      return null;
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
      return null;
    }

    const summaryData = await summaryRes.json();

    return summaryData.thumbnail ? summaryData.thumbnail.source : null;
  } catch (err) {
    console.error(`Error fetching Wikipedia image for "${query}":`, err.message);
    return null;
  }
}

