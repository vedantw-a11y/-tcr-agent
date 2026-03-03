export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { token, account_id, date_since, date_until } = req.query;
    if (!token || !account_id) return res.status(400).json({ error: "token and account_id required" });
    const since = date_since || new Date().toISOString().split("T")[0];
    const until = date_until || since;
    let allData = [];
    let url = `https://graph.facebook.com/v21.0/${account_id}/insights?level=ad&time_range={"since":"${since}","until":"${until}"}&fields=ad_name,ad_id,spend,actions,cost_per_action_type,impressions,clicks&filtering=[{"field":"spend","operator":"GREATER_THAN","value":"0"}]&limit=500&access_token=${token}`;
    while (url) {
      const response = await fetch(url);
      const json = await response.json();
      if (json.error) return res.status(400).json({ error: json.error.message });
      if (json.data) allData = [...allData, ...json.data];
      url = json.paging?.next || null;
    }
    return res.status(200).json({ data: allData, count: allData.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
