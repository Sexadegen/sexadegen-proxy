const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  
  // 1. Get the slug from query params, default to 'anomaly-ai' if not provided
  const params = event.queryStringParameters || {};
  const slug = params.slug || "anomaly-ai";
  
  // 2. Reconstruct the query string without the 'slug' parameter to pass to OpenSea
  const searchParams = new URLSearchParams(event.queryStringParameters);
  searchParams.delete("slug");
  const qs = searchParams.toString() ? "?" + searchParams.toString() : "";

  // 3. Insert the dynamic slug into the URL
  const url = `https://api.opensea.io/api/v2/listings/collection/${slug}/all${qs}`;

  try {
    const r = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
    if (!r.ok) {
      return { statusCode: r.status, body: await r.text() };
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
