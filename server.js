// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Endpoint para OAuth2
app.get('/api/oauth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    // 1. Intercambiar el código por el token
    const params = new URLSearchParams();
    params.append('client_id', process.env.CLIENT_ID);
    params.append('client_secret', process.env.CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.REDIRECT_URI);
    params.append('scope', 'identify guilds');

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, token_type } = tokenResponse.data;

    // 2. Obtener la lista de servidores
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    res.json(guildsResponse.data);
  } catch (err) {
    console.error('OAuth Error:', err.response?.data || err.message);
    res.status(500).send('OAuth2 failed');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor backend en puerto ${PORT}`));
