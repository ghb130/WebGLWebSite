requirejs(["Utils", "Shader", "Engine"], main);
function main(){
  var Engine = new EngineObj();
  Engine.init();
  console.log("\nEngine initialization complete.\n\n");
}
