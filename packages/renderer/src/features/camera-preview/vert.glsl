varying vec2 v_uv;

float PREVIEW_SIZE = 0.33;
float DEFAULT_Z_POS = 0.5;

void main() {
  v_uv = uv;
  vec3 offset = vec3(
    -DEFAULT_Z_POS / PREVIEW_SIZE + DEFAULT_Z_POS,
    -DEFAULT_Z_POS / PREVIEW_SIZE + DEFAULT_Z_POS,
    0.0
  );
  gl_Position = vec4(position + offset, DEFAULT_Z_POS / PREVIEW_SIZE);
}
