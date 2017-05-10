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
}
