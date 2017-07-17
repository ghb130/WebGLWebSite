//==============================================================================
//CORE ENGINE OBJECT
//Foundation of the WebGl Website Project.
//==============================================================================
function EngineObj(){
  this.gl = null;
  this.canvas = null;
  this.initialized = false;
  this.Shaders = [];
  //==============================================================================
  //Initializes the Graphics Engine
  //==============================================================================
  this.init = function(){
    canvas = document.getElementById('WebGL');
    try{
      gl = canvas.getContext("experimental-webgl");
      //Load And Parse Shaders Here
      gl.clearColor(0.3,0.3,0.3,1);
      gl.enable(gl.DEPTH_TEST);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewportWidth = window.innerWidth;
      gl.viewportHeight = window.innerHeight;
      gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.initialized = true;
    }
    catch(e){
      canvas.style.display = 'none';
    }
  }
  //==============================================================================
  //Download And Compile Shader Code From Server.
  //Shaders must use the (shaderName)_(f/v).glsl naming convention
  //==============================================================================
  this.LoadShaders = function(ShaderNames){
    shaderNames.forEach(function(element, index){
      this.Shaders.push(new Shader(element, this.gl));
    });
  }
}
