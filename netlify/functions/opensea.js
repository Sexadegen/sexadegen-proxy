const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  const params = event.queryStringParameters || {};
  const slug = params.slug || "anomaly-ai";
  const tokenIds = params.token_ids; // e.g., "2137,2138"

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

  // 2. ROVERS LOGIC (The New Precise Way)
  const idList = tokenIds.split(',').map(id => id.trim());
  const contractAddress = "0xe0e7f149959c6cac0ddc2cb4ab27942bffda1eb4";

  try {
    // Fetch each rare ID specifically from the single NFT endpoint
    const promises = idList.map(async (id) => {
      const singleUrl = `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts/${id}`;
      const res = await fetch(singleUrl, { 
        headers: { "X-API-KEY": API_KEY, "accept": "application/json" } 
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.nft; // OpenSea returns { nft: { ... } }
    });

    const nfts = (await Promise.all(promises)).filter(item => item !== null);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ nfts }), // Wrap it in 'nfts' to match your frontend logic
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
