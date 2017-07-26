requirejs(["Code/Utils", "Code/Shader", "Code/Object", "Code/Animation", "Code/Camera", "Code/Engine"], main);
//==============================================================================
//MAIN - call engine code here
//Program wide variables:
var gl = null;
var canvas = null;
var Engine = null;
//==============================================================================
function main(){
  Engine = new EngineCore();
  Engine.init();
  console.log("\nEngine initialization complete.\n\n");
  Engine.Objects.Monkey.transform.setPos(0,0,0);
  var rot = quat.create();
  var axis = vec3.fromValues(0,1,0);
  vec3.normalize(axis, axis);
  quat.setAxisAngle(rot, axis, Math.PI);
  var destTrans = new Transform(vec3.fromValues(0,0,0), undefined, rot);
  var slide = new Animation(Engine.Objects.Monkey, destTrans, 50, ANIM_PSR|INT_LINE|CIRCULAR|REVERSED|REPEAT);
  Engine.AnimPlayer.addAnim(slide);
  Engine.Update();
}
