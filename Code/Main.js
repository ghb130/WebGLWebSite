requirejs(["Utils", "Shader", "Engine"], main);
function main(){
  Load("Shaders/Standard_f.glsl",LogReq);
  setTimeout(doneLoading, 3000);
  var Engine = new EngineObj();
  Engine.init();
}
