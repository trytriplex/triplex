varying vec2 v_uv;

void main() {
  v_uv = uv;
  vec3 offset = vec3(-1.3, -1.3, 0.0);
  gl_Position = vec4(position + offset, 2.0);
}
