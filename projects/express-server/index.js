const bodyParser = require('body-parser');
const express = require('express');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // Simplified authorization for demonstration purposes
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized')
  }

  next();
});

app.get('/get-endpoint', (_req, res, _next) => { res.send('Hello world'); });

app.post('/post-endpoint', (req, res, _next) => { res.send(`Hello world. ${JSON.stringify(req.body)}`); });

app.listen(process.env.PORT ?? 3010, () => {
  console.log('Server up & running');
});