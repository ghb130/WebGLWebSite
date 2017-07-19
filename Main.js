requirejs(["Lib/gl-matrix", "Code/Utils", "Code/Shader", "Code/Object", "Code/Engine"], main);
function main(){
  var Engine = new EngineCore();
  Engine.init();
  console.log("\nEngine initialization complete.\n\n");
}
