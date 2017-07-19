//==============================================================================
//REMOVE LOADING TEXT
//==============================================================================
function doneLoading() {
  var x = document.getElementById('LoadingText');
  x.style.display = 'none';
}
//==============================================================================
//ENGINE STATE OBJECT
//Helps keep track of state variables.
//==============================================================================
function EngineState(){
  this.initialized = false;
}
//==============================================================================
//TIMEKEEPER OBJECT
//Holds usefull information about time
//==============================================================================
function TimeKeeper(){
  this.initTime = Date.now();
  this.lastFrame = this.initTime;
  this.deltaTime = 0;
  this.frameRate = 0;
  this.update = function(){
    this.deltaTime = Date.now()-this.lastFrame;
    this.lastFrame = Date.now();
    this.frameRate = Math.round((1000/this.deltaTime)*10)/10;
  }
}
//==============================================================================
//TRANSFORM OBJECT
//Maintains information about an objects position in space.
//==============================================================================
function Transform(){
  this.position = new vec3();
  this.scale = new vec3();
  this.rotation = new quat();
}
