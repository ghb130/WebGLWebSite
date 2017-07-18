attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_UV;

uniform mat4 u_ModelMatrix;
uniform mat4 u_MVPMatrix;
uniform mat4 u_InvNormal;

varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_Position;
varying vec4 v_Color;

void main() {
  gl_Position = u_MVPMatrix * a_Position;
  v_Position = gl_Position;
  v_Color = vec4(1,1,1,1);
}
