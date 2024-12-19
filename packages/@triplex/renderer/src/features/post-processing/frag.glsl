uniform sampler2D u_maskTexture;
uniform vec2 u_viewportSize;
varying vec2 v_uv;

const float LINE_WEIGHT = 2.5;
const vec3 LINE_COLOR = vec3(1.0, 1.0, 0.0);

// Inspired by "Simple GPU Outline Shaders" by Mark Raynsford
// See: https://io7m.com/documents/outline-glsl
void main() {
  float dx = 1.0 / u_viewportSize.x * LINE_WEIGHT;
  float dy = 1.0 / u_viewportSize.y * LINE_WEIGHT;

  vec2 uvCenter = v_uv;
  vec2 uvRight = vec2(uvCenter.x + dx, uvCenter.y);
  vec2 uvTop = vec2(uvCenter.x, uvCenter.y - dx);
  vec2 uvTopRight = vec2(uvCenter.x + dx, uvCenter.y - dx);

  float mCenter = texture2D(u_maskTexture, uvCenter).a;
  float mTop = texture2D(u_maskTexture, uvTop).a;
  float mRight = texture2D(u_maskTexture, uvRight).a;
  float mTopRight = texture2D(u_maskTexture, uvTopRight).a;

  float dT = abs(mCenter - mTop);
  float dR = abs(mCenter - mRight);
  float dTR = abs(mCenter - mTopRight);

  float delta = 0.0;
  delta = max(delta, dT);
  delta = max(delta, dR);
  delta = max(delta, dTR);

  if (delta > 0.0) {
    gl_FragColor = vec4(LINE_COLOR, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
