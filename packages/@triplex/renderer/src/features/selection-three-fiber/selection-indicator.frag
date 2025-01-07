uniform sampler2D u_selectionMask;
uniform sampler2D u_hoveredMask;
uniform vec3 u_lineColor;
uniform vec2 u_viewportSize;
uniform float u_lineWeight;

varying vec2 v_uv;

float sampleMask(sampler2D mask, float lineWeight) {
  float dx = 1.0 / u_viewportSize.x * lineWeight;
  float dy = 1.0 / u_viewportSize.y * lineWeight;

  vec2 uvCenter = v_uv;
  vec2 uvTop = vec2(uvCenter.x, uvCenter.y - dx);
  vec2 uvRight = vec2(uvCenter.x + dx, uvCenter.y);
  vec2 uvTopRight = vec2(uvCenter.x + dx, uvCenter.y - dx);

  float mCenter = texture2D(mask, uvCenter).a;
  float mTop = texture2D(mask, uvTop).a;
  float mRight = texture2D(mask, uvRight).a;
  float mTopRight = texture2D(mask, uvTopRight).a;

  float dT = abs(mCenter - mTop);
  float dR = abs(mCenter - mRight);
  float dTR = abs(mCenter - mTopRight);

  float delta = 0.0;
  delta = max(delta, dT);
  delta = max(delta, dR);
  delta = max(delta, dTR);

  return delta;
}

// Inspired by "Simple GPU Outline Shaders" by Mark Raynsford
// See: https://io7m.com/documents/outline-glsl
void main() {
  float delta = sampleMask(u_selectionMask, u_lineWeight);

  if (delta > 0.0) {
    gl_FragColor = vec4(u_lineColor, 1.0);
    return;
  }

  delta = sampleMask(u_hoveredMask, u_lineWeight);

  if (delta > 0.0) {
    gl_FragColor = vec4(u_lineColor, 1.0);
    return;
  }

  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
