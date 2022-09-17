'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', async (req, res) => {
  console.log('tá rolando123');
  res.send('Hello World');
});

app.get('/charges/:id', async (req, res) => {
  console.log('tá rolando123');
  res.json({id: 123});
});

app.post('/charges/new', async (req, res) => {
  console.log('tá rolando123');
  res.json({id: 123});
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
