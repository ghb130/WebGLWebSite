requirejs(["Utils", "Shader", "Engine"], main);
function main(){
  var Engine = new EngineObj();
  Engine.init();
<<<<<<< HEAD
  console.log("\nEngine initialization complete.\n\n");
=======
  console.log("Done with init");
  console.log(Engine.Shaders.Standard.Uniforms);
  console.log(Engine.Shaders.Standard.Attributes);
  console.log(Engine.Shaders.Standard.Program);
>>>>>>> b5b89275b379e3caf92ad9889b71ccce319d5848
}
/*
var str =
  'attribute vec4 position;\n' +
  'attribute vec4 size[20];\n' +
  'void main() {\n' +
  '  gl_Position = position;\n' +
  '}\n';
var re = /attribute (.+\b) (.+);/gi;
var re2 = / (.+\b) (\w+).?(\d+)*.?/i;
var found = str.match(re);
console.log(found);
found.forEach(function(element){
  var found2 = element.match(re2);
  console.log(found2);
});
*/
