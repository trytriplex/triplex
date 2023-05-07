uniform float u_windTime;
uniform vec4 u_waveA;
uniform vec4 u_waveB;
uniform vec4 u_waveC;

varying float v_vertexHeight;

vec3 gerstnerWave(vec4 wave, vec3 position) {
  float steepness = wave.z;
  float wavelength = wave.w;

  float k = 2.0 * PI / wavelength;
  float c = sqrt(9.8 / k);

  vec2 d = normalize(wave.xy);

  float f = k * (dot(d, position.xz) - c * u_windTime);
  float a = steepness / k;

  return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
}

vec3 displace(vec3 position) {
  vec3 p = position;

  p += gerstnerWave(u_waveA, p);
  p += gerstnerWave(u_waveB, p);
  p += gerstnerWave(u_waveC, p);

  v_vertexHeight = p.y;

  return p;
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

vec3 recalcNormals(vec3 newPos) {
  float offset = 0.001;
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 neighbour1 = position + tangent * offset;
  vec3 neighbour2 = position + bitangent * offset;

  vec3 displacedNeighbour1 = displace(neighbour1);
  vec3 displacedNeighbour2 = displace(neighbour2);

  vec3 displacedTangent = displacedNeighbour1 - newPos;
  vec3 displacedBitangent = displacedNeighbour2 - newPos;

  return normalize(cross(displacedTangent, displacedBitangent));
}

void main() {
  vec3 localPosition = displace(position);

  csm_Position = localPosition;
  csm_Normal = recalcNormals(localPosition);
}
