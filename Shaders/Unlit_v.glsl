attribute vec3 a_Position;
//attribute vec3 a_Normal;
attribute vec2 a_UV;

//uniform mat4 u_ModelMatrix;
uniform mat4 u_MVPMatrix;
//uniform mat4 u_InvNormal;

varying vec2 v_UV;
//varying vec3 v_Normal;
//varying vec4 v_Position;

void main() {
  gl_Position = u_MVPMatrix * vec4(a_Position ,1.0);
  v_UV = a_UV;
}
