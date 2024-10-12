varying vec2 v_uv;
varying float v_depth;
uniform float u_maxDepth;
uniform float u_resolution;
uniform sampler2D u_depthTexture;

float readTex(vec2 pxOffset) {
  vec2 actualUV = (round(uv * u_resolution) + pxOffset) / u_resolution;
  float result = texture2D(u_depthTexture, actualUV).r;
  return result;
}

void main() {
  float center = readTex(vec2(0.0, 0.0));
  float left = readTex(vec2(-1.0, 0.0));
  float right = readTex(vec2(1.0, 0.0));
  float top = readTex(vec2(0.0, 1.0));
  float bottom = readTex(vec2(0.0, -1.0));
  float topLeft = readTex(vec2(-1.0, 1.0));
  float bottomLeft = readTex(vec2(-1.0, -1.0));
  float topRight = readTex(vec2(1.0, 1.0));
  float bottomRight = readTex(vec2(1.0, -1.0));

  float depth =
    (center +
      left +
      right +
      top +
      bottom +
      topLeft +
      bottomLeft +
      topRight +
      bottomRight) /
    9.0 *
    u_maxDepth;

  v_uv = uv;
  v_depth = depth;

  vec3 offset = vec3(0.0, 0.0, depth);
  csm_Position = position - offset;
}
