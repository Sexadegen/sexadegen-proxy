const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  
  // Define standard headers to be used in all responses
  const headers = {
    "Access-Control-Allow-Origin": "https://sexadegen.com", // Restrict to your domain for security
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // 1. Handle Preflight OPTIONS request
  // Browsers send this automatically before the real request to check permissions
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: headers,
      body: "OK"
    };
  }

  // 2. Get the slug from query params
  const params = event.queryStringParameters || {};
  const slug = params.slug || "roversxyz";
  
  // 3. Reconstruct the query string for OpenSea
  const searchParams = new URLSearchParams(event.queryStringParameters);
  searchParams.delete("slug");
  const qs = searchParams.toString() ? "?" + searchParams.toString() : "";

  // 4. Construct the OpenSea API URL
  const url = `https://api.opensea.io/api/v2/listings/collection/${slug}/all${qs}`;

  try {
    const r = await fetch(url, { 
      headers: { "X-API-KEY": API_KEY } 
    });

    if (!r.ok) {
      const errorText = await r.text();
      return { 
        statusCode: r.status, 
        headers: headers, 
        body: errorText 
      };
    }

    const data = await r.json();
    
    // 5. Return the successful data with CORS headers
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data),
    };

  } catch (err) {
    return { 
      statusCode: 500, 
      headers: headers, 
      body: JSON.stringify({ error: err.message }) 
    };
  }
};
