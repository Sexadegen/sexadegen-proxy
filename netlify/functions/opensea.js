const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  const params = event.queryStringParameters || {};
  
  const slug = params.slug || "anomaly-ai";
  const tokenIds = params.token_ids; // e.g., "2137,2138"
  
  let url;

  if (tokenIds) {
    // ROVERS LOGIC
    const idList = tokenIds.split(',');
    // We use the 'contract' endpoint because it supports the 'token_ids' parameter properly.
    // Replace the address below if your contract address is different
    const CONTRACT_ADDRESS = "0xe0e7f149959c6cac0ddc2cb4ab27942bffda1eb4";
    const idParams = idList.map(id => `token_ids=${id.trim()}`).join('&');
    
    url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts?${idParams}`;
  } else {
    // ANOMALY AI LOGIC
    const searchParams = new URLSearchParams(params);
    searchParams.delete("slug");
    const qs = searchParams.toString() ? "?" + searchParams.toString() : "";
    url = `https://api.opensea.io/api/v2/listings/collection/${slug}/all${qs}`;
  }

  console.log("FINAL API URL:", url);

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
