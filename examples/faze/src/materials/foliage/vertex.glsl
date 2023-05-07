uniform float u_effectBlend;
uniform float u_inflate;
uniform float u_scale;
uniform float u_windSpeed;
uniform float u_windTime;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

vec2 applyWind(vec2 offset) {
  // Get the Y normal which we will use to apply difference rotation speeds to emulate wind.
  float boundedYNormal = remap(normal.y, -1.0, 1.0, 0.0, 1.0);

  float posXZ = position.x + position.z;
  float power = u_windSpeed / 5.0 * -0.5;

  // Top facing normals will move faster than bottom facing normals.
  float topFacing = remap(sin(u_windTime + posXZ), -1.0, 1.0, 0.0, power);
  float bottomFacing = remap(cos(u_windTime + posXZ), -1.0, 1.0, 0.0, 0.05);
  float mixedValue = mix(bottomFacing, topFacing, boundedYNormal);

  return rotate(offset, mixedValue);
}

vec2 calcInitialOffsetFromUVs() {
  // Offset the xy position of each vertex by its UV value.
  // This requires every quad of the tree foliage to be uniformly
  // mapped over the entire UV map from bottom left to top right.
  vec2 offset = vec2(
    // Each UV value starts off from a value of [0, 1].
    // We remap it to [-1, 1] so it is nicely centered.
    remap(uv.x, 0.0, 1.0, -1.0, 1.0),
    remap(uv.y, 0.0, 1.0, -1.0, 1.0)
  );

  // Invert the vertex offset so it's positioned towards the camera.
  offset *= vec2(-1.0, 1.0);

  // Normalize and scale the offset (makes the foliage larger or smaller).
  offset = normalize(offset) * u_scale;

  return offset;
}

vec3 inflateOffset(vec3 offset) {
  // Optionally inflate the offset (moves the quads along the normal direction).
  return offset + normal.xyz * u_inflate;
}

void main() {
  vec2 vertexOffset = calcInitialOffsetFromUVs();

  vertexOffset = applyWind(vertexOffset);

  vec3 inflatedVertexOffset = inflateOffset(vec3(vertexOffset, 0.0));

  // Transform to world view space.
  vec4 worldViewPosition = modelViewMatrix * vec4(position, 1.0);

  // Apply the vertex offset to world view space
  worldViewPosition += vec4(mix(vec3(0.0), inflatedVertexOffset, u_effectBlend), 0.0);

  // Transform into clip space - we're done!
  csm_PositionRaw = projectionMatrix * worldViewPosition;
}
