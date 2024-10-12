/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function drawPixel(
  textureSource: Uint8Array,
  xOrigin: number,
  yOrigin: number,
  x: number,
  y: number,
  resolution: number,
  depth: number,
  maxDepth: number,
  radiusSq: number,
) {
  if (xOrigin + x + 1 > resolution || xOrigin + x < 0) {
    // Bail out if the x/y coordinates are out of bounds.
    return;
  }

  // We convert from pixel space to texture source space, given an x and y
  // coordinate we need to find its appropriate location in a one dimensional array.
  const textureIndex = xOrigin + x + yOrigin * resolution + y * resolution;
  const maxArrValue = 255;
  const currentValue = textureSource.at(textureIndex) ?? 0;
  const distanceSq = x * x + y * y;
  const depthRatio = 1 - distanceSq / radiusSq;
  const nextValue = Math.floor(
    (Math.min(depth, maxDepth) / maxDepth) * maxArrValue * depthRatio,
  );

  textureSource[textureIndex] = Math.min(
    Math.max(currentValue, nextValue),
    maxArrValue,
  );
}

export function drawLine(
  textureSource: Uint8Array,
  xOrigin: number,
  yOrigin: number,
  fromX: number,
  toX: number,
  y: number,
  resolution: number,
  depth: number,
  maxDepth: number,
  radiusSq: number,
) {
  let x = fromX;
  while (x !== toX) {
    drawPixel(
      textureSource,
      xOrigin,
      yOrigin,
      x,
      y,
      resolution,
      depth,
      maxDepth,
      radiusSq,
    );
    x--;
  }
}

export function drawCirclePart(
  source: Uint8Array,
  xOrigin: number,
  yOrigin: number,
  x: number,
  y: number,
  res: number,
  depth: number,
  maxDepth: number,
  radiusSq: number,
) {
  drawPixel(source, xOrigin, yOrigin, x, y, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, -x, y, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, x, -y, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, -x, -y, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, y, x, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, -y, x, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, y, -x, res, depth, maxDepth, radiusSq);
  drawPixel(source, xOrigin, yOrigin, -y, -x, res, depth, maxDepth, radiusSq);

  // Fill in this circle part by drawing four horizontal lines.
  // See: https://stackoverflow.com/questions/5607946/bresenhams-circle-algorithm-filling-question
  drawLine(source, xOrigin, yOrigin, x, -x, y, res, depth, maxDepth, radiusSq);
  drawLine(source, xOrigin, yOrigin, x, -x, -y, res, depth, maxDepth, radiusSq);
  drawLine(source, xOrigin, yOrigin, y, -y, x, res, depth, maxDepth, radiusSq);
  drawLine(source, xOrigin, yOrigin, y, -y, -x, res, depth, maxDepth, radiusSq);
}

export function drawCircle(
  textureSource: Uint8Array,
  uvX: number,
  uvY: number,
  resolution: number,
  depth: number,
  maxDepth: number,
  radius: number,
  radiusCoverage: number,
): void {
  // This logic is based on the Bresenham algorithm for drawing circles.
  // We start by drawing a circle where x = 0 and y = radius.
  // We do this so we're in pixel land and then translate them to texture coords.
  // 1. Center point UV XY coordinates
  // 2. Circle XY coordinates
  // 3. Data source index, calculated from (1) and (2).
  // See: https://www.geeksforgeeks.org/bresenhams-circle-drawing-algorithm
  const rasterizedXOrigin = Math.round(uvX * resolution);
  const rasterizedYOrigin = Math.round(uvY * resolution);
  const rasterizedRadiusCoverage =
    Math.round((uvX + radiusCoverage) * resolution) - rasterizedXOrigin;
  const rasterizedRadius =
    Math.round((uvX + radius) * resolution) - rasterizedXOrigin;

  let x = 0;
  let y = rasterizedRadiusCoverage;
  let decisionParam = 3 - 2 * rasterizedRadiusCoverage;

  while (y >= x) {
    drawCirclePart(
      textureSource,
      rasterizedXOrigin,
      rasterizedYOrigin,
      x,
      y,
      resolution,
      depth,
      maxDepth,
      rasterizedRadius * rasterizedRadius,
    );

    if (decisionParam > 0) {
      y--;
      decisionParam = decisionParam + 4 * (x - y) + 10;
    } else {
      decisionParam = decisionParam + 4 * x + 6;
    }

    x++;
  }
}
