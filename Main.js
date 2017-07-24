requirejs(["Code/Utils", "Code/Shader", "Code/Object", "Code/Engine"], main);
//==============================================================================
//MAIN
var gl = null;
var canvas = null;
var Engine = null;
var tempRot = 0;
//==============================================================================
function main(){
  Engine = new EngineCore();
  Engine.init();
  console.log("\nEngine initialization complete.\n\n");
  console.log(Engine.Objects[0]);
  console.log(Engine.Shaders.Standard);
  console.log(Engine.Matrices);
  console.log(gl);
  gl.useProgram(Engine.Shaders.Standard.Program);
  Engine.Update();
}
