const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  const params = event.queryStringParameters || {};
  const slug = params.slug || "anomaly-ai";
  const tokenIds = params.token_ids; // e.g., "1661,2137"

  // 1. ANOMALY AI LOGIC (Backward Compatible)
  if (!tokenIds) {
    const searchParams = new URLSearchParams(params);
    searchParams.delete("slug");
    const qs = searchParams.toString() ? "?" + searchParams.toString() : "";
    const url = `https://api.opensea.io/api/v2/listings/collection/${slug}/all${qs}`;
    
    try {
      const r = await fetch(url, { headers: { "X-API-KEY": API_KEY, "accept": "application/json" } });
      const data = await r.json();
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // 2. ROVERS LOGIC (Marketplace/Price Logic)
  const idList = tokenIds.split(',').map(id => id.trim());

  try {
    /** * We use the 'best listing' endpoint because the standard NFT metadata 
     * endpoint does NOT include current prices.
     */
    const promises = idList.map(async (id) => {
      const priceUrl = `https://api.opensea.io/api/v2/listings/collection/${slug}/nfts/${id}/best`;
      
      const res = await fetch(priceUrl, { 
        headers: { "X-API-KEY": API_KEY, "accept": "application/json" } 
      });

      if (!res.ok) return null; // Likely not listed
      
      const data = await res.json();
      
      // We format this to match your frontend expectation
      return {
        identifier: id,
        price_data: data.price // This contains the 'current.value' (Wei)
      };
    });

    const results = (await Promise.all(promises)).filter(item => item !== null);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ nfts: results }), 
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
