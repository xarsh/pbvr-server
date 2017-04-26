import cubeCell from './cube-cell';

const round = num => Math.round(num * 100000) / 100000;

const getNumberOfParticles = (cell, max) => {
  const alpha = cell.scalar.reduce((a, b) => a + b, 0) / max / cell.scalar.length;
  let rho = Math.pow((-Math.PI * 0.5) / Math.log(1 - alpha), 1 / 3.0);
  if (Math.random() < (rho % 1)) rho++;
  return Math.floor(rho);
};

const getScalarsFromIndex = (data, i, j, k) => {
  return [
    data.values[k * data.y * data.x + j * data.x + (i + 1)],
    data.values[k * data.y * data.x + j * data.x + i],
    data.values[k * data.y * data.x + (j + 1) * data.x + i],
    data.values[k * data.y * data.x + (j + 1) * data.x + (i + 1)],
    data.values[(k + 1) * data.y * data.x  + j * data.x + (i + 1)],
    data.values[(k + 1) * data.y * data.x  + j * data.x + i],
    data.values[(k + 1) * data.y * data.x  + (j + 1) * data.x + i],
    data.values[(k + 1) * data.y * data.x + (j + 1) * data.x + (i + 1)]
  ];
};

const getCoordinatesFromIndex = (i, j, k) => {
  return [
    [i + 1, j, k],
    [i, j, k],
    [i, j + 1, k],
    [i + 1, j + 1, k],
    [i + 1, j, k + 1],
    [i, j, k + 1],
    [i, j + 1, k + 1],
    [i + 1, j + 1, k + 1],
  ];
};

export default {
  generateParticles(data, n = 1) { // n: ensemble
    const particles = [];

    for (let z = 0; z < data.z - 1; z++) {
      for (let y = 0; y < data.y - 1; y++) {
        for (let x = 0; x < data.x - 1; x++) {
          const s = getScalarsFromIndex(data, x, y, z);
          if (s.reduce((a, b) => a + b, 0) === 0) continue;

          const cube = new cubeCell(...getCoordinatesFromIndex(x, y, z));
          cube.setVertexScalar(...s);

          for(let i = 0; i < n; i++) {
            const rho = getNumberOfParticles(cube, data.max);
            for(let j = 0; j < rho; j++) {
              const particlePosition = cube.randomSampling();
              const position = cube.localToGlobal(particlePosition);
              const scalar = cube.interpolateScalar(particlePosition);
              particles.push([...position, scalar].map(round));
            }
          }
        }
      }
    }
    return particles;
  },
};
