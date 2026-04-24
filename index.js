const express = require("express");
const axios = require("axios");
const qs = require("querystring");
const app = express();

app.use(express.json());

const ZOHO_FUNCTION_URL =
  "https://www.zohoapis.eu/crm/v7/functions/rc_inbound_call_handler/actions/execute?auth_type=apikey&zapikey=1003.d89421bc750a3cd74b4231e4e87ddec1.f528c7900108c276fb9f6f88c95f28c7";

app.post("/webhook", async (req, res) => {
  const validationToken = req.headers["validation-token"];
  if (validationToken) {
    res.setHeader("Validation-Token", validationToken);
    return res.status(200).send(validationToken);
  }

  // Only forward if it's actually a telephony session event with parties
  const body = req.body;
  const parties = body?.body?.parties;
  if (!parties || parties.length === 0) {
    console.log("No parties in payload - skipping");
    return res.status(200).send("skipped");
  }

  try {
    const payload = JSON.stringify(req.body);
    console.log("Incoming payload:", payload);
    const arguments_str = JSON.stringify({ payload: payload });
    await axios.post(
      ZOHO_FUNCTION_URL,
      { arguments: arguments_str },
      { headers: { "Content-Type": "application/json" } },
    );
    res.status(200).send("ok");
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
