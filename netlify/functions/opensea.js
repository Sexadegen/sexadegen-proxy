const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  const params = event.queryStringParameters || {};
  
  // 1. Get parameters
  const slug = params.slug || "anomaly-ai";
  const tokenIds = params.token_ids; // e.g., "2137,2138"
  
  let url;

  // 2. Determine which OpenSea endpoint to use
  if (tokenIds) {
    /** * ROVERS PROJECT LOGIC: 
     * To get specific NFTs (like #2137) instead of the first items (#1, #2),
     * we use the /collection/{slug}/nfts endpoint with repeated token_ids.
     */
    const idList = tokenIds.split(',');
    
    // OpenSea v2 requires repeating the key for each ID: ?token_ids=2137&token_ids=2138
    const idParams = idList.map(id => `token_ids=${id.trim()}`).join('&');
    
    url = `https://api.opensea.io/api/v2/collection/${slug}/nfts?${idParams}`;
  } else {
    /** * ANOMALY AI PROJECT LOGIC (Default): 
     * Stays exactly the same to avoid breaking your floor price sync.
     */
    const searchParams = new URLSearchParams(params);
    searchParams.delete("slug");
    const qs = searchParams.toString() ? "?" + searchParams.toString() : "";
    url = `https://api.opensea.io/api/v2/listings/collection/${slug}/all${qs}`;
  }

  try {
    const r = await fetch(url, { 
      headers: { 
        "X-API-KEY": API_KEY,
        "accept": "application/json"
      } 
    });

    if (!r.ok) {
      const errorText = await r.text();
      return { statusCode: r.status, body: errorText };
    }

    const data = await r.json();

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
