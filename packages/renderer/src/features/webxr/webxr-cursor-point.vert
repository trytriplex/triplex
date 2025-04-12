uniform float size;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  float distance = length(cameraPosition - worldPosition.xyz);
  float scale = distance / size;
  vec3 scaledPosition = position * scale;
  gl_Position =
    projectionMatrix * viewMatrix * modelMatrix * vec4(scaledPosition, 1.0);
}
