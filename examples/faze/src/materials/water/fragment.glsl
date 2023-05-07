varying float v_vertexHeight;

uniform float u_opacity;
uniform vec3 u_highlightColor;
uniform vec3 u_waterColor;

float contrast = 3.0;
float offset = 0.15;
float brightness = 1.0;

vec3 color() {
  float mask = (pow(v_vertexHeight, 2.0) - offset) * contrast;

  vec3 diffuseColor = mix(u_waterColor, u_highlightColor, mask);
  diffuseColor *= brightness;

  return diffuseColor;
}

void main() {
  csm_DiffuseColor = vec4(color(), u_opacity);
}
