//==============================================================================
//CORE ENGINE OBJECT
//Foundation of the WebGl Website Project.
//Properties:
//--gl - a webGL rendering context
//--canvas - html canvas reference
//--initialized - is the engine fully initialized?
//--Shaders - object/dictionary of Shader objects the engine can use (see Shader.js)
//==============================================================================
function EngineCore(){
  this.gl = null;
  this.canvas = null;
  this.State = new EngineState();
  this.TimeKeeper = new TimeKeeper();
  this.Shaders = {};
  this.Objects = {};
  //==============================================================================
  //Initializes the Graphics Engine
  //==============================================================================
  this.init = function(){
    canvas = document.getElementById('WebGL');
    try{
      this.gl = canvas.getContext("experimental-webgl");
      this.LoadShaders(['Standard']);
      this.LoadMeshData(['Monkey']);
      glMatrix.ENABLE_SIMD = true;
      this.gl.clearColor(0.3,0.3,0.3,1);
      this.gl.enable(this.gl.DEPTH_TEST);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.gl.viewportWidth = window.innerWidth;
      this.gl.viewportHeight = window.innerHeight;
      this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.State.initialized = true;
      doneLoading();
    }
    catch(e){
      canvas.style.display = 'none';
      doneLoading();
    }
  }
  //==============================================================================
  //Download And Compile Shader Code From Server.
  //Shaders must use the (shaderName)_(f/v).glsl naming convention
  //==============================================================================
  this.LoadShaders = function(ShaderNames){
    console.group("Shader Compilation");
    ShaderNames.forEach(function(element){
        console.groupCollapsed("Shader: "+element);
        this.Shaders[element] = new Shader(element, this.gl);
        console.groupEnd();
        console.log("Succesfully loaded shader: " + element);
    }, this);
    console.groupEnd();
  }
  //==============================================================================
  //Download and bind mesh data from server
  //==============================================================================
  this.LoadMeshData = function(MeshNames){
    console.group("Mesh Processing");
    MeshNames.forEach(function(element){
      console.groupCollapsed("Mesh: "+element);
      this.Objects[element] = new Object(element, this.gl);
      console.groupEnd();
      console.log("Succesfully loaded mesh: "+element);
    }, this);
    console.groupEnd();
  }
}
