const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  const params = event.queryStringParameters || {};
  
  // 1. Get parameters
  const slug = params.slug || "anomaly-ai";
  const tokenIds = params.token_ids; // e.g., "269,312,1801"
  
  let url;

  // 2. Determine which OpenSea endpoint to use
  if (tokenIds) {
    /** * ROVERS PROJECT LOGIC: 
     * Fetch specific rare items using the NFT endpoint. 
     * Note: OpenSea v2 handles multiple IDs via comma or repeating params. 
     * We'll fetch the base metadata (which includes listing info).
     */
    const idList = tokenIds.split(',');
    // OpenSea v2 uses repeating 'token_ids' parameters
    const idParams = idList.map(id => `token_ids=${id.trim()}`).join('&');
    url = `https://api.opensea.io/api/v2/chain/ethereum/contract/0xe0e7f149959c6cac0ddc2cb4ab27942bffda1eb4/nfts?${idParams}`;
  } else {
    /** * ANOMALY AI PROJECT LOGIC (Default): 
     * Fetch general collection listings for floor prices.
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
