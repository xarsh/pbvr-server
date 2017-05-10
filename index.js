import express from 'express';
import cors from 'cors';
import compression from 'compression';
import fs from 'fs';

import pbvr from './lib/pbvr';

const app = express();

app.use(cors());
app.use(compression()); // default compression level is decent enough

app.get('/', (req, res) => res.send('PBVR server'));

app.get('/lobster/:ensemble', (req, res) => { // TODO: replace with better way to load volume
  fs.readFile('./data/lobster.json', 'utf-8', (err, data) => {
    const volume = JSON.parse(data);
    const ensemble = parseInt(req.params.ensemble);
    res.json(pbvr.generateParticles(volume, ensemble));
  });
});

app.listen(3000, () => console.log('started.'));
