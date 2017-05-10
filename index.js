import express from 'express';
import cors from 'cors';
import compression from 'compression';
import fs from 'fs';

import pbvr from './lib/pbvr';

const app = express();

app.use(cors());
app.use(compression()); // default compression level is decent enough

app.get('/', (req, res) => res.send('PBVR server'));

app.get('/lobster/:ensemble', (req, res) => { // TODO: replace with better way to read json
  fs.readFile('./data/lobster.json', 'utf-8', (err, data) => {
    const d = pbvr.generateParticles(JSON.parse(data), req.params.ensemble);
    res.json(d);
  });
});

app.listen(3000, () => console.log('started.'));
