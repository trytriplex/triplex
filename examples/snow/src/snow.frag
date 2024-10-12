varying float v_depth;

void main() {
  float r = 1.2 - v_depth * 5.0;
  float g = 1.2 - v_depth * 0.1;
  float b = 1.5;

  csm_DiffuseColor = vec4(r, g, b, 1.0);
}
