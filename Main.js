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
  Engine.Objects.Monkey.transform.setPos(-0.5,0,0);
  var rot = quat.create();
  var axis = vec3.fromValues(0,1,0);
  vec3.normalize(axis, axis);
  quat.setAxisAngle(rot, axis, Math.PI);
  var destTrans = new Transform(undefined, undefined, rot);
  var destTrans2 = new Transform(vec3.fromValues(0.5,0,0), undefined, undefined);
  var rot = new Animation(Engine.Objects.Monkey, destTrans, 20, ANIM_ROT|INT_LINE|CIRCULAR|REPEAT);
  var slide = new Animation(Engine.Objects.Monkey, destTrans2, 50, ANIM_POS|INT_LINE|BOUNCE|REPEAT);
  Engine.AnimPlayer.addAnim(rot);
  Engine.AnimPlayer.addAnim(slide);
  Engine.Update();
}
