//==============================================================================
//CORE ENGINE OBJECT
//Foundation of the WebGl Website Project.
//==============================================================================
function EngineObj(){
  this.gl = null;
  this.canvas = null;
  this.initialized = false;
  this.Shaders = {};
  //==============================================================================
  //Initializes the Graphics Engine
  //==============================================================================
  this.init = function(){
    canvas = document.getElementById('WebGL');
    try{
      this.gl = canvas.getContext("experimental-webgl");
      //Load And Parse Shaders Here
      this.LoadShaders(['Standard']);
      this.gl.clearColor(0.3,0.3,0.3,1);
      this.gl.enable(this.gl.DEPTH_TEST);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.gl.viewportWidth = window.innerWidth;
      this.gl.viewportHeight = window.innerHeight;
      this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.initialized = true;
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
        console.group("Shader: "+element);
        this.Shaders[element] = new Shader(element, this.gl);
        console.groupEnd();
        console.log("Succesfully loaded shader: " + element);
    }, this);
    console.groupEnd();
  }
}
