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
  var destTrans2 = new Transform(vec3.fromValues(-1,1,-3), undefined, undefined);
  var destTrans3 = new Transform(vec3.fromValues(1,1,-3), undefined, undefined);
  var destTrans4 = new Transform(vec3.fromValues(1,-1,-3), undefined, undefined);

  var animInfRot = new animInf(Engine.World.Monkey, destTrans, 50);
  animInfRot.flags = ANIM_ROT|INT_LINE|CIRCULAR|REPEAT;
  var rot = new Animation(animInfRot);

  var animInfSlide = new animInf(Engine.World.Monkey, [destTrans2, destTrans3, destTrans4], 50);
  animInfSlide.flags = ANIM_POS|INT_BEZ|BOUNCE|REPEAT|SMOOTHED;
  var slide = new Animation(animInfSlide);

  Engine.AnimPlayer.addAnim('Spin360',rot);
  Engine.AnimPlayer.addAnim('SlideLR', slide);

  var trans = new Transform();
  trans.setPos(0,0,-5);
  Engine.Instantiate(Engine.Objects.Monkey, trans);
  console.log(Engine.World);

  Engine.Update();
}
