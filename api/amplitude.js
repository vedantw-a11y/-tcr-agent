export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { api_key, secret_key, event_type, date, group_by } = req.query;
    if (!api_key || !secret_key) return res.status(400).json({ error: "api_key and secret_key required" });
    const dateCompact = (date || new Date().toISOString().split("T")[0]).replace(/-/g, "");
    const authStr = Buffer.from(api_key + ":" + secret_key).toString("base64");
    const eventParam = encodeURIComponent(JSON.stringify({ event_type: event_type || "trial_activated" }));
    const groupParam = encodeURIComponent(JSON.stringify({ type: "event", value: group_by || "data" }));
    const url = "https://amplitude.com/api/2/events/segmentation?e=" + eventParam + "&start=" + dateCompact + "&end=" + dateCompact + "&g=" + groupParam + "&limit=10000";
    const response = await fetch(url, { headers: { "Authorization": "Basic " + authStr } });
    const json = await response.json();
    return res.status(200).json(json);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
