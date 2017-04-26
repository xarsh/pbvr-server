//  baseCell class has some methods to realize interpolation of cells.
//
//  Some baseCell's methods are as follows:
//    constructor()         : variables 'V', 'vertices' are need to overwrite in sub class
//    interpolateScalar     : calculate scalar in local coordinates by using interpolation.

//  The methods should be implemented are as follows:
//    setVertexScalar           : scalar's of vertex must be given.
//    getInterpolationFunction  : The interpolation function are denoted here.
//    randomSampling            : This method returns local coordinates randomly
//    calculateVolume           : Cell's volume depends on the cell type
//    differentialFunction      : This is needed to calculate 'globalToLocal'

export default class baseCell {
  constructor() {
    this.V = [];
    this.vertices = 0;
  }

  localToGlobal(local) {
    let x = 0;
    let y = 0;
    let z = 0;

    const N = this.getInterpolationFunctions(local);

    for (let i = 0; i < this.vertices; i++) {
      x += N[ i ] * this.V[ i ][ 0 ];
      y += N[ i ] * this.V[ i ][ 1 ];
      z += N[ i ] * this.V[ i ][ 2 ];
    }

    const global = [ x, y, z ];
    return global;
  }

  globalToLocal (global) {
    const E = 0.0001;    //Convergence condition
    const X = global;
    const x0 = [0.5, 0.5 * global[1] / global[0], 0.5 * global[2] / global[0]];   //  initial value of local coordinates

    const maxLoop = 10;
    let i;
    for(i = 0; i < maxLoop; i++){
      const X0 = this.localToGlobal(x0);
      const dX = this.minus_1_1(X, X0);
      const J = this.jacobian(x0);
      const dx = this.multiply_3_1(this.inverse(this.transpose(J)), dX);  //  CAUTION: we have to transpose

      if(Math.sqrt(dx[0] * dx[0] + dx[1] * dx[1] + dx[2] * dx[2]) < E)
      break;

      x0[0] += dx[0];
      x0[1] += dx[1];
      x0[2] += dx[2];
    }
    if(i == maxLoop){
      console.log('error is happen in globalToLocal');
    }
    return x0;
  }

  interpolateScalar(local) {
    const N = this.getInterpolationFunctions(local);

    let S = 0;
    for(let i = 0; i < this.vertices; i++){
      S += N[i] * this.scalar[i];
    }
    return S;
  }

  interpolateAlpha(local) {
    const N = this.getInterpolationFunctions(local);

    let S = 0;
    for(let i = 0; i < this.vertices; i++){
      S += N[i] * this.alpha[i];
    }
    return S;
  }

  jacobian(local) {
    const dN = this.differentialFunction(local);  //dN = [dNdp[6], dNdq[6], dNdr[6]]

    let dxdp = 0;
    let dydp = 0;
    let dzdp = 0;
    for(let i = 0; i < this.vertices; i++){
      dxdp += dN[0][i] * this.V[i][0];
      dydp += dN[0][i] * this.V[i][1];
      dzdp += dN[0][i] * this.V[i][2];
    }

    let dxdq = 0;
    let dydq = 0;
    let dzdq = 0;
    for(let i = 0; i < this.vertices; i++){
      dxdq += dN[1][i] * this.V[i][0];
      dydq += dN[1][i] * this.V[i][1];
      dzdq += dN[1][i] * this.V[i][2];
    }

    let dxdr = 0;
    let dydr = 0;
    let dzdr = 0;
    for(let i = 0; i < this.vertices; i++){
      dxdr += dN[2][i] * this.V[i][0];
      dydr += dN[2][i] * this.V[i][1];
      dzdr += dN[2][i] * this.V[i][2];
    }

    const jacobiMatrix = [[dxdp, dydp, dzdp], [dxdq, dydq, dzdq], [dxdr, dydr, dzdr]];
    return jacobiMatrix;
  }

  distance(A, B) {
    return Math.sqrt(Math.pow(A[0] - B[0], 2) + Math.pow(A[1] - B[1], 2) + Math.pow(A[2] - B[2], 2));
  }

  determinant(A) {
    const a0 = A[0][0] * A[1][1] * A[2][2];
    const a1 = A[1][0] * A[2][1] * A[0][2];
    const a2 = A[2][0] * A[0][1] * A[1][2];

    const b0 = A[0][2] * A[1][1] * A[2][0];
    const b1 = A[1][2] * A[2][1] * A[0][0];
    const b2 = A[2][2] * A[0][1] * A[1][0];

    return a0 + a1 + a2 - b0 - b1 - b2;
  }


  inverse(A) {
    const Ainv = [];
    Ainv[0] = new Array(3);
    Ainv[1] = new Array(3);
    Ainv[2] = new Array(3);
    const detA_inv = 1 / this.determinant(A);

    Ainv[0][0] = detA_inv * (A[1][1] * A[2][2] - A[1][2] * A[2][1]);
    Ainv[0][1] = detA_inv * (A[0][2] * A[2][1] - A[0][1] * A[2][2]);
    Ainv[0][2] = detA_inv * (A[0][1] * A[1][2] - A[0][2] * A[1][1]);

    Ainv[1][0] = detA_inv * (A[1][2] * A[2][0] - A[1][0] * A[2][2]);
    Ainv[1][1] = detA_inv * (A[0][0] * A[2][2] - A[0][2] * A[2][0]);
    Ainv[1][2] = detA_inv * (A[0][2] * A[1][0] - A[0][0] * A[1][2]);

    Ainv[2][0] = detA_inv * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    Ainv[2][1] = detA_inv * (A[0][1] * A[2][0] - A[0][0] * A[2][1]);
    Ainv[2][2] = detA_inv * (A[0][0] * A[1][1] - A[0][1] * A[1][0]);

    return Ainv;
  }

  transpose(A) {
    const At = [];
    At[0] = new Array(3);
    At[1] = new Array(3);
    At[2] = new Array(3);

    At[0][0] = A[0][0];
    At[0][1] = A[1][0];
    At[0][2] = A[2][0];

    At[1][0] = A[0][1];
    At[1][1] = A[1][1];
    At[1][2] = A[2][1];

    At[2][0] = A[0][2];
    At[2][1] = A[1][2];
    At[2][2] = A[2][2];

    return At;
  }

  multiply_3_1(A, B) {
    const C = new Array(3);
    C[0] = A[0][0] * B[0] + A[0][1] * B[1] + A[0][2] * B[2];
    C[1] = A[1][0] * B[0] + A[1][1] * B[1] + A[1][2] * B[2];
    C[2] = A[2][0] * B[0] + A[2][1] * B[1] + A[2][2] * B[2];
    return C;
  }

  minus_1_1(A, B) {
    const C = new Array(3);
    C[0] = A[0] - B[0];
    C[1] = A[1] - B[1];
    C[2] = A[2] - B[2];
    return C;
  }

  vectorproduct(A, B) {
    const C = [A[1] * B[2] - A[2] * B[1],
    A[2] * B[0] - A[0] * B[2],
    A[0] * B[1] - A[1] * B[0]];
    return C;
  }
}
