import express from 'express';
import fetch from 'node-fetch'; // O si usas Node 18+, fetch es global

const app = express();

app.get('/callback', async (req, res) => {
  const code = req.query.code; // Aquí recibes el código que te envía Discord

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

    // Usas el token para pedir info de usuario:
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }, // Aquí va el token de acceso
    });

    const userData = await userRes.json();

    // Ahora puedes usar userData (ejemplo: nombre, id, avatar)
    return res.redirect(`/dashboard.html?user=${encodeURIComponent(userData.username)}`);

  } catch (error) {
    console.error(error);
    return res.status(500).send('Error during Discord OAuth');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
