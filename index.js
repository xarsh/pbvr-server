import express from 'express';
import compression from 'compression';

import pbvr from './lib/pbvr';

const app = express();

app.use(compression()); // default compression level is decent enough

app.get('/', (req, res) => res.send('PBVR server'));

app.get('/lobster', (req, res) => {
  const data = require('./data/lobster.json');
  res.json(pbvr.generateParticles(data));
});

app.listen(3000, () => console.log('started.'));
