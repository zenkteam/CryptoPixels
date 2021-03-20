function generatePixelMatrix(){
    const matrix = [];
    // generate matrix
    var i = 1;
    for (var r = 0; r < 100; r++) {
      matrix.push([]);
      for (var c = 0; c < 100; c++) {
        matrix[r].push({
          id: i++,
          status: STATI.AVAILABLE,

          // upper left corner of pixel area
          x: c * 10,
          y: r * 10,
        });
      }
    }

    for (var r = 0; r < 100; r++) {
      for (var c = 0; c < 100; c++) {
        matrix[r][c].r = Math.abs(Math.floor(30 + r * 0.0 + c * 2.0));
        matrix[r][c].g = Math.abs(Math.floor(30 + r * 2.0 + c * 0.0));
        matrix[r][c].b = Math.abs(Math.floor(-200 + (r + 1) * 0.5 + (c + 1) * 0.5));
        // calculate hex value
        matrix[r][c].hex = rgbToHex(matrix[r][c].r, matrix[r][c].g, matrix[r][c].b);
      }
    }
}


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}