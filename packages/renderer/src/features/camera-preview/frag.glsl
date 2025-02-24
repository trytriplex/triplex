varying vec2 v_uv;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
