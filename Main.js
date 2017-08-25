requirejs(["Code/Utils", "Code/Shader", "Code/Object", "Code/ImgPlane", "Code/Text", "Code/Animation", "Code/Camera", "Code/Engine"], main);
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
  Engine.Objects.Monkey.transform.setAxisAngle(vec3.fromValues(0,1,0),Math.PI/4);

  var destTrans = new Transform();
  destTrans.setAxisAngle(vec3.fromValues(0,1,0), Math.PI/2);
  var animInfRot = new animInf(Engine.World.Monkey, destTrans,30);
  animInfRot.flags = ANIM_ROT|INT_LINE|BOUNCE|REPEAT|SMOOTHED|RELATIVE;
  var rotate = new Keyframe(animInfRot);

  Engine.AnimPlayer.addAnim('Spin90',rotate);

  var img = new ImgPlane('Profile', 0.8);
  Engine.World.Img = img;
  Engine.World.Img.transform.setPos(-.55,1,-0.05);
  Engine.World.Img.parent = Engine.World.Monkey;

/*  var trans = new Transform();
  for (var k = -3; k <= 3; k=k+3){
    for (var j = -3; j <= 3; j=j+3){
      for (var i = 1; i < 10; i++){
        trans.setPos(k,j,-3*i);
        var instance = Engine.Instantiate(Engine.Objects.Monkey, trans);
        Engine.World[instance].parent = Engine.World.Monkey;
      }
    }
  }*/

  var string =
  `Hours`;
  var text = new Text2D(string, "Verdana", "White");
  Engine.World.Hello = text;
  Engine.World.Hello.transform.setPos(1,0,0);
  Engine.World.Hello.parent = Engine.World.Monkey;

  destTrans = new Transform();
  destTrans.setPAxisAngle(vec3.fromValues(0,0,1), Math.PI);
  animInfRot = new animInf(Engine.World.Hello, destTrans, 10);
  animInfRot.flags = ANIM_ROT|INT_LINE|CIRCULAR|REPEAT|ANIMP;
  rotate = new Keyframe(animInfRot);

  Engine.AnimPlayer.addAnim('TextSpin', rotate);

  var string =
  `Minutes`;
  var text = new Text2D(string, "Verdana", "White", 0.75);
  Engine.World.Minutes = text;
  Engine.World.Minutes.transform.setPos(1.5,0,0);
  Engine.World.Minutes.parent = Engine.World.Monkey;

  destTrans = new Transform();
  destTrans.setPAxisAngle(vec3.fromValues(0,0,1), Math.PI);
  animInfRot = new animInf(Engine.World.Minutes, destTrans, 120);
  animInfRot.flags = ANIM_ROT|INT_LINE|CIRCULAR|REPEAT|ANIMP;
  rotate = new Keyframe(animInfRot);

  Engine.AnimPlayer.addAnim('TextSpin2', rotate);

  var string =
  `Yaw`;
  var text = new Text2D(string, "Verdana", "White", 0.75);
  Engine.World.Yaw = text;
  Engine.World.Yaw.transform.setPos(1.5,0,0);
  Engine.World.Yaw.parent = Engine.World.Monkey;

  destTrans = new Transform();
  destTrans.setPAxisAngle(vec3.fromValues(0,1,0), Math.PI);
  animInfRot = new animInf(Engine.World.Yaw, destTrans, 50);
  animInfRot.flags = ANIM_ROT|INT_LINE|BOUNCE|RELATIVE|REPEAT|ANIMP;
  rotate = new Keyframe(animInfRot);

  Engine.AnimPlayer.addAnim('TextSpin3', rotate);

  console.groupCollapsed("Runtime Logging");
  Engine.Update();
}
