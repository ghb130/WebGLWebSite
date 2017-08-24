//==============================================================================
//ENGINE STATE OBJECT
//Helps keep track of state variables.
//==============================================================================
function EngineState(){
  this.initialized = false;
  this.ActiveCamera = 0;
}
//==============================================================================
//Request texture data from server
//==============================================================================
function LoadTex(Addr, type, obj){
  obj.Textures[type] = gl.createTexture();
  //Create a temporary 1x1 pixel texture until real texture is loaded
  gl.bindTexture(gl.TEXTURE_2D, obj.Textures[type]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([30, 30, 30, 255]));
  var image = new Image();
  image.src = Addr;
  image.addEventListener('load', function(){
    console.groupCollapsed("Receiving Texture...");
    console.log("Loading Texture: "+Addr);
    gl.bindTexture(gl.TEXTURE_2D, obj.Textures[type]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_2D, Engine.Extensions.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    console.groupEnd();
  });
}
//==============================================================================
//TIMEKEEPER OBJECT
//Holds usefull information about time
//==============================================================================
function TimeKeeper(){
  this.initTime = window.performance.now();
  this.lastFrame = this.initTime;
  this.deltaTime = 16;
  this.frameRate = 60;
  this.ticked = false;
  this.frameTime = 0;
  this.interFrameTime = 0;
  this.lastFrames = [60,60,60,60,60];
  this.update = function(){
    if(this.frameRate == Infinity){this.frameRate=60}
    this.deltaTime = window.performance.now()-this.lastFrame;
    this.lastFrame = window.performance.now();
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
      }, 75);
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
  this.parentRot = quat.create();
  vec3.copy(this.position, pos);
  vec3.copy(this.scale, scale);
  quat.copy(this.rotation, rot);

  this.apply = function(matrix){
    var prs = mat4.create();
    mat4.fromRotationTranslationScale(prs, this.rotation, this.position, this.scale);
    mat4.multiply(matrix,matrix,prs);
  }
  this.applyParent = function(matrix){
    var r = mat4.create();
    mat4.fromQuat(r, this.parentRot);
    mat4.multiply(matrix, matrix, r);
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
  this.setAxisAngle = function(vector, rad){
    quat.setAxisAngle(this.rotation, vector, rad);
  }
  this.setPAxisAngle = function(vector, rad){
    quat.setAxisAngle(this.parentRot, vector, rad);
  }
  this.copy = function(trans){
    vec3.copy(this.position, trans.position);
    vec3.copy(this.scale, trans.scale);
    quat.copy(this.rotation, trans.rotation);
    quat.copy(this.parentRot, trans.parentRot);
  }
  this.add = function(trans){
    vec3.add(this.position, this.position, trans.position);
    vec3.add(this.scale, this.scale, trans.scale);
    quat.multiply(this.rotation, this.rotation, trans.rotation);
    quat.normalize(this.rotation, this.rotation);
    quat.multiply(this.parentRot, this.parentRot, trans.parentRot);
    quat.normalize(this.parentRot, this.parentRot);
  }
  this.difference = function(trans){
    vec3.subtract(this.position,  trans.position, this.position);
    vec3.subtract(this.scale, trans.scale, this.scale);
    var invQuat = quat.create();
    quat.invert(invQuat, trans.rotation);
    quat.multiply(this.rotation, this.rotation, invQuat);
    quat.normalize(this.rotation, this.rotation);
    quat.invert(invQuat, trans.parentRot);
    quat.multiply(this.parentRot, this.parentRot, invQuat);
    quat.normalize(this.parentRot, this.parentRot);
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
