const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const API_KEY = "cae072efedf0460d80b57358fcbb5a5e";
  const qs = event.rawQuery ? "?" + event.rawQuery : "";
  const url = `https://api.opensea.io/api/v2/listings/collection/anomaly-ai/all${qs}`;

  try {
    const r = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
    if (!r.ok) {
      return { statusCode: r.status, body: await r.text() };
    }
    const data = await r.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
