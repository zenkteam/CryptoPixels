/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useEffect, useState } from "react";
import { SelectPlane } from "../components";


export default function Pixels({ }) {


  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  function generatePixelMatrix() {
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

    /* generate colors
    for (var r = 0; r < 100; r++) {
      for (var c = 0; c < 100; c++) {
        matrix[r][c].r = Math.abs(Math.floor(30 + r * 0.0 + c * 2.0));
        matrix[r][c].g = Math.abs(Math.floor(30 + r * 2.0 + c * 0.0));
        matrix[r][c].b = Math.abs(Math.floor(-200 + (r + 1) * 0.5 + (c + 1) * 0.5));
        // calculate hex value
        matrix[r][c].hex = rgbToHex(matrix[r][c].r, matrix[r][c].g, matrix[r][c].b);
      }
    }*/

    return matrix;
  }

  function matrixToArray(matrix) {
    const pixels = [];
    for (var r = 0; r < matrix.length; r++) {
      for (var c = 0; c < matrix[r].length; c++) {
        pixels.push(matrix[r][c]);
      }
    }
    return pixels;
  }

  function getPixelsByIds(ids) {
    const list = [];
    for (var id of ids) {
      list.push(pixels[id - 1]);
    }
    return list;
  }

  function onSelected(selection) {
    const selected = getPixelsByIds(selection);
    setSelection(selected);
    // all selected, no matter which status they have
    console.log('onSelected', selected);
  }

  function resetSelection() {
    onSelected([]);
  }

  function onZoomUpdate(zoom) {
    setZoom(zoom);
  }

  function checkForSpecialPiece(x, y) {
    const specialBoundaries = [
      { name: 'centerpiece', x: { from: 400, to: 600 }, y: { from: 400, to: 600 } },
      { name: 'upperLeftGuard', x: { from: 200, to: 400 }, y: { from: 200, to: 400 } },
      { name: 'upperRightGuard', x: { from: 600, to: 800 }, y: { from: 200, to: 400 } },
      { name: 'lowerLeftGuard', x: { from: 200, to: 400 }, y: { from: 600, to: 800 } },
      { name: 'lowerRightGuard', x: { from: 600, to: 800 }, y: { from: 600, to: 800 } },
    ];

    for (var boundary of specialBoundaries) {
      if (x >= boundary.x.from && x < boundary.x.to && y >= boundary.y.from && y < boundary.y.to) {
        return boundary.name;
      }
    }

    return false;
  }

  const [matrix, setMatrix] = useState();
  const [pixels, setPixels] = useState();
  const [zoom, setZoom] = useState('auto');
  const [selection, setSelection] = useState([]);

  const STATI = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    SOLD: 'sold',
  }

  useEffect(() => {
    // generate Data only once
    const matrix = generatePixelMatrix();
    const pixels = matrixToArray(matrix);

    // mark reserved
    for (var pixel of pixels) {
      if (checkForSpecialPiece(pixel.x, pixel.y)) {
        pixel.status = STATI.RESERVED;
      }
    }

    setMatrix(matrix);
    setPixels(pixels);

    // to manually select pixels call:
    // setSelection([pixels[22, 23, 24]]);
  }, []);

  return (
    <div>
      {/* Only render pixels if they have already been generated */}
      {pixels &&
        <SelectPlane
          pixels={pixels}
          selection={selection}
          zoom={zoom}
          onSelected={value => {
            onSelected(value);
          }}
          onZoomUpdate={value => {
            onZoomUpdate(value);
          }}
        ></SelectPlane>
      }
      <div class="reset-button" onClick={resetSelection}>Reset</div>
    </div>
  );
}
