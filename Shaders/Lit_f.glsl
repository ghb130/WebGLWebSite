precision mediump float;
uniform sampler2D u_Diffuse;
varying vec2 v_UV;
void main() {
  gl_FragColor = texture2D(u_Diffuse, v_UV);
}
