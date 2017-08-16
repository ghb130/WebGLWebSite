//==============================================================================
//ENGINE STATE OBJECT
//Helps keep track of state variables.
//==============================================================================
function EngineState(){
  this.initialized = false;
  this.ActiveCamera = 0;
}
//==============================================================================
//TIMEKEEPER OBJECT
//Holds usefull information about time
//==============================================================================
function TimeKeeper(){
  this.initTime = Date.now();
  this.lastFrame = this.initTime;
  this.deltaTime = 16;
  this.frameRate = 60;
  this.ticked = false;
  this.frameTime = 0;
  this.interFrameTime = 0;
  this.lastFrames = [60,60,60,60,60];
  this.update = function(){
    if(this.frameRate == Infinity){this.frameRate=60}
    this.deltaTime = Date.now()-this.lastFrame;
    this.lastFrame = Date.now();
    this.lastFrames.shift();
    this.lastFrames.push((1000/this.deltaTime));
    for (var i = 0; i < this.lastFrames.length; i++){
      this.frameRate = this.frameRate + this.lastFrames[i];
    }
    this.frameRate = (this.frameRate/(this.lastFrames.length+1));
    if(!this.ticked){
      this.ticked = true;
      window.setTimeout(()=>{
        document.getElementById("frameRateText").innerHTML =
        this.frameRate.toFixed(2).toString()+" fps<br>"+
        "CPU Time: "+this.frameTime.toString()+" ms<br>"+
        "Frametime: "+this.interFrameTime.toString()+" ms";
        Engine.TimeKeeper.ticked = false;
      }, 50);
    }
  }
}
//==============================================================================
//TRANSFORM OBJECT
//Maintains information about an objects position in space.
//==============================================================================
function Transform(pos = vec3.create(), scale = vec3.fromValues(1,1,1), rot = quat.create()){
  this.position = vec3.create();
  this.scale = vec3.fromValues(1,1,1);
  this.rotation = quat.create();
  vec3.copy(this.position, pos);
  vec3.copy(this.scale, scale);
  quat.copy(this.rotation, rot);

  this.apply = function(matrix){
    var prs = mat4.create();
    mat4.fromRotationTranslationScale(prs, this.rotation, this.position, this.scale);
    mat4.multiply(matrix,matrix,prs);
  }
  this.setPos = function(x,y,z){
    vec3.set(this.position, x, y, z);
  }
  this.setScale = function(x,y,z){
    vec3.set(this.scale, x, y, z);
  }
  this.setRotationQuat = function(quat){
    vec4.copy(this.rotation, quat);
  }
  this.copy = function(trans){
    vec3.copy(this.position, trans.position);
    vec3.copy(this.scale, trans.scale);
    quat.copy(this.rotation, trans.rotation);
  }
  this.add = function(trans){
    vec3.add(this.position, this.position, trans.position);
    vec3.add(this.scale, this.scale, trans.scale);
    quat.multiply(this.rotation, this.rotation, trans.rotation);
    quat.normalize(this.rotation, this.rotation);
  }
  this.difference = function(trans){
    vec3.subtract(this.position,  trans.position, this.position);
    vec3.subtract(this.scale, trans.scale, this.scale);
    var invQuat = quat.create();
    quat.invert(invQuat, trans.rotation);
    quat.multiply(this.rotation, this.rotation, invQuat);
    quat.normalize(this.rotation, this.rotation);
  }
}
//==============================================================================
//MATRIX STACK
//Maintains a general purpose stack for use with gl-matrix
//==============================================================================
function Stack(){
  this.stack = [];
  this.push = function(matrix){
    this.stack.push(mat4.clone(matrix));
  }
  this.pop = function(){
    return this.stack.pop();
  }
}
//==============================================================================
//REMOVE LOADING TEXT
//==============================================================================
function doneLoading() {
  var x = document.getElementById('LoadingText');
  x.style.display = 'none';
}
//==============================================================================
//Animation Info Struct
//Passed to the animation function to provide information on how to animate an object
//Arguments:
//  obj: the object to animate
//  trans: the destination Transform
//  speed: the rate of playback of the animation in % per second
//  count(optional): number of times to repeat the animation
//  flags: bitwise set of flags to determine anim behavior. See function: animation
//  callback: function to call when animation terminates
//  smoothing: amount by which to smooth the animation
//==============================================================================
function animInf(obj, trans, speed, count = 1){
  this.Object = obj;
  this.Trans = trans;
  this.speed = speed;
  this.count = count;
  this.flags = 0b000000000000;
  this.callback = null;
  this.smoothing = 1;
}
