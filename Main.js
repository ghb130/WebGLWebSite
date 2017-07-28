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
  Engine.World.Monkey = Engine.Objects.Monkey;
  console.log("\nEngine initialization complete.\n\n");
  Engine.Objects.Monkey.transform.setPos(-1,-1,-3);
  var rot = quat.create();
  var axis = vec3.fromValues(0,1,1);
  vec3.normalize(axis, axis);
  quat.setAxisAngle(rot, axis, Math.PI);
  var destTrans = new Transform(undefined, undefined, rot);
  var destTrans2 = new Transform(vec3.fromValues(1,-1,-3), undefined, undefined);
  var destTrans3 = new Transform(vec3.fromValues(-1,1,-3), undefined, undefined);
  var rot = new Animation(Engine.World.Monkey, destTrans, 50, ANIM_ROT|INT_LINE|CIRCULAR|REPEAT);
  var slide = new Animation(Engine.World.Monkey, destTrans2, 50, ANIM_POS|INT_LINE|BOUNCE|REPEAT);
  var slide2 = new Animation(Engine.World.Monkey, destTrans3, 150, ANIM_POS|INT_LINE|BOUNCE|REPEAT);
  Engine.AnimPlayer.addAnim('Spin360',rot);
  Engine.AnimPlayer.addAnim('SlideLR', slide);
  Engine.AnimPlayer.addAnim('SlideUD', slide2);
  Engine.Update();
}
