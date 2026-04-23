const express = require("express");
const axios = require("axios");
const qs = require("querystring");
const app = express();

app.use(express.json());

const ZOHO_FUNCTION_URL =
  "https://www.zohoapis.eu/crm/v7/functions/rc_inbound_call_handler/actions/execute?auth_type=apikey&zapikey=1003.b683e26f81a5cf3ff92a874922f0f0a9.9e6083925488901143ce0086708e1d4c";

app.post("/webhook", async (req, res) => {
  const validationToken = req.headers["validation-token"];
  if (validationToken) {
    console.log("Validation handshake - echoing token");
    res.setHeader("Validation-Token", validationToken);
    return res.status(200).send(validationToken);
  }

  try {
    const payload = JSON.stringify(req.body);
    console.log("Incoming payload:", payload);
    await axios.post(ZOHO_FUNCTION_URL, qs.stringify({ payload: payload }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    res.status(200).send("ok");
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
