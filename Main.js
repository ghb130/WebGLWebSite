requirejs(["Code/Utils", "Code/Shader", "Code/Object", "Code/Animation", "Code/Camera", "Code/Engine"], main);
//==============================================================================
//MAIN - call engine code here
//Program wide variables:
var gl = null;
var canvas = null;
var Engine = null;
var tempRot = 0;
//==============================================================================
function main(){
  Engine = new EngineCore();
  Engine.init();
  console.log("\nEngine initialization complete.\n\n");
  Engine.Update();
}
