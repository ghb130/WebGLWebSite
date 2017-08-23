requirejs(["Code/Utils", "Code/Shader", "Code/Object", "Code/Text", "Code/Animation", "Code/Camera", "Code/Engine"], main);
//==============================================================================
//MAIN - call engine code here
//Program wide variables:
var gl = null;
var canvas = null;
var Engine = null;
var frame = null;
//==============================================================================
function main(){
  Engine = new EngineCore();
  Engine.init();
  console.log("%c\nEngine initialization complete.\n\n", 'color: green');

  Engine.World.Monkey = Engine.Objects.Monkey;
  Engine.Objects.Monkey.transform.setPos(0,0,-3);

  var rot = quat.create();
  var axis = vec3.fromValues(0,1,0);
  vec3.normalize(axis, axis);
  quat.setAxisAngle(rot, axis, Math.PI/4);
  Engine.Objects.Monkey.transform.setRotationQuat(rot);
  quat.setAxisAngle(rot, axis, Math.PI/2);

  var destTrans = new Transform(undefined, undefined, rot);
  var destTrans2 = new Transform(vec3.fromValues(0,2,0), undefined, undefined);
  var destTrans3 = new Transform(vec3.fromValues(2,2,0), undefined, undefined);
  var destTrans4 = new Transform(vec3.fromValues(2,0,0), undefined, undefined);

  var animInfRot = new animInf(Engine.World.Monkey, destTrans, 25);
  animInfRot.flags = ANIM_ROT|INT_LINE|BOUNCE|REPEAT|SMOOTHED|RELATIVE;
  var rot = new Animation(animInfRot);

  Engine.AnimPlayer.addAnim('Spin90',rot);

  /*var trans = new Transform();
  for (var k = -3; k <= 3; k=k+3){
    for (var j = -3; j <= 3; j=j+3){
      for (var i = 1; i < 30; i++){
        trans.setPos(k,j,-3*i);
        var instance = Engine.Instantiate(Engine.Objects.Monkey, trans);
        Engine.World[instance].parent = Engine.World.Monkey;
      }
    }
  }*/
  var string =
  `Hello
    world
  test`;
  var text = new Text2D(string, "Verdana", "White");
  Engine.World.Hello = text;
  Engine.World.Hello.transform.setPos(1.5,0,0);
  Engine.World.Hello.parent = Engine.World.Monkey;

  console.log(Engine.World);
  console.groupCollapsed("Runtime Logging");
  Engine.Update();
}
