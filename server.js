import express from 'express';
import fetch from 'node-fetch'; // O en Node 18+ puedes usar fetch globalmente
import { client } from './index.js'; // Asegúrate que exportas el cliente de Discord en tu index.js

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Ruta original /callback (OAuth2 Authorization Code Flow)
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  const params = new URLSearchParams();
  params.append('client_id', '1382408855597617152');
  params.append('client_secret', 'SSEGsNepSPE1GtRdTgbJxSp_G4rUydf-');
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', 'https://stumblex-web.vercel.app/callback');
  params.append('scope', 'identify guilds');

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Token exchange failed', data: tokenData });
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();

    return res.redirect(`/dashboard.html?user=${encodeURIComponent(userData.username)}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error during Discord OAuth');
  }
});

// Ruta para guardar el token enviado desde frontend (Implicit Grant Flow)
app.post('/save-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  console.log('Token recibido desde frontend:', token);
  res.json({ success: true, message: 'Token recibido correctamente' });
});

// NUEVA RUTA: Retorna los servidores donde está el bot
app.get('/bot-guilds', (req, res) => {
  if (!client || !client.guilds) {
    return res.status(500).json({ error: 'El cliente de Discord no está listo' });
  }

  const botGuilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
  }));

  res.json(botGuilds);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
