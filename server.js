const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

const TOKENS_FILE = './tokens.json';

// Leer tokens existentes
function readTokens() {
  try {
    const data = fs.readFileSync(TOKENS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Guardar tokens
function saveToken(token) {
  const tokens = readTokens();
  tokens.push(token);
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

app.post('/save-token', (req, res) => {
  const { token, userId } = req.body;
  if (!token || !userId) {
    return res.status(400).json({ error: 'Token y userId son obligatorios' });
  }

  saveToken({ userId, token, date: new Date().toISOString() });
  res.json({ message: 'Token guardado' });
});

app.listen(3000, () => {
  console.log('Servidor iniciado en puerto 3000');
});
