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
  this.State = new EngineState();
  this.TimeKeeper = new TimeKeeper();
  this.Matrices = {};
  this.MatStack = new Stack();
  this.Shaders = {};
  this.Objects = {};
  this.World = {};
  this.Cameras = [];
  this.AnimPlayer = new AnimPlayer();
  //==============================================================================
  //Initializes the Graphics Engine
  //==============================================================================
  this.init = function(){
    canvas = document.getElementById('WebGL');
    try{
      gl = canvas.getContext("experimental-webgl");
      this.LoadShaders(['Standard']);
      this.LoadMeshData(['Monkey']);
      this.Cameras.push(new Camera(this.Cameras.length));
      this.Cameras[0].transform.position = vec3.fromValues(0,0,3);
      this.Matrices.ModelMatrix = mat4.create();
      this.Matrices.NormalMatrix = mat4.create();
      this.Matrices.MVPMatrix = mat4.create();
      this.Matrices.TempMatrix = mat4.create();
      gl.clearColor(0.3,0.3,0.3,1);
      gl.enable(gl.DEPTH_TEST);
      this.State.initialized = true;
      doneLoading();
    }
    catch(e){
      canvas.style.display = 'none';
      doneLoading();
    }
  }
  //==============================================================================
  //Draws current frame on canvas
  //Avoid all 'this' references, as this function is part of update which uses callbacks
  //==============================================================================
   this.renderFrame = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    //Reset matrices
    mat4.identity(Engine.Matrices.ModelMatrix);
    //Set view to current active camera
    Engine.Cameras[Engine.State.ActiveCamera].setView();
    //Push default matrices to top of stack
    Engine.MatStack.push(Engine.Matrices.ModelMatrix);
    Engine.MatStack.push(Engine.Matrices.MVPMatrix);

    for (var obj in Engine.World){
    if(Engine.World.hasOwnProperty(obj)){
      //Pop fresh model and mvp Matrices
      Engine.Matrices.MVPMatrix = Engine.MatStack.pop();
      Engine.Matrices.ModelMatrix = Engine.MatStack.pop();
      //Create and alias for the current object
      var obj = Engine.World[obj];
      //Set shader for current object
      gl.useProgram(Engine.Shaders[obj.Shader].Program);
      //Perform per object transformations here
      obj.transform.apply(Engine.Matrices.ModelMatrix);
      mat4.multiply(Engine.Matrices.MVPMatrix, Engine.Matrices.MVPMatrix, Engine.Matrices.ModelMatrix);
      //Bind attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.position);
      gl.vertexAttribPointer(Engine.Shaders[obj.Shader].Attributes.a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.uv);
      gl.vertexAttribPointer(Engine.Shaders[obj.Shader].Attributes.a_UV, 2, gl.FLOAT, false, 0, 0);
      // gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.normal);
      // gl.vertexAttribPointer(Engine.Shaders[obj.Shader].Attributes.a_Normal, 3, gl.FLOAT, false, 0, 0);
      //Bind Uniforms
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, obj.Textures[0]);
      gl.uniform1i(Engine.Shaders[obj.Shader].Uniforms.u_Sampler, 0);
      gl.uniformMatrix4fv(Engine.Shaders[obj.Shader].Uniforms.u_MVPMatrix, false, Engine.Matrices.MVPMatrix);
      //Draw
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  obj.Buffer.Index);
      gl.drawElements(gl.TRIANGLES, obj.Buffer.Index.numVerts, gl.UNSIGNED_SHORT, 0);
    }}
  }
  //==============================================================================
  //Primary render loop
  //Avoid all 'this' references, as this function uses a callback
  //==============================================================================
  this.Update = function(){
    var begin = window.performance.now();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewportWidth = window.innerWidth;
    gl.viewportHeight = window.innerHeight;
    //Call any runtime logic here
    requestAnimationFrame(Engine.Update, canvas);
    Engine.renderFrame();
    Engine.TimeKeeper.update();
    Engine.AnimPlayer.update();
    Engine.TimeKeeper.frameTime = (window.performance.now()-begin).toFixed(2);
  }
  //==============================================================================
  //Download And Compile Shader Code From Server.
  //Shaders must use the (shaderName)_(f/v).glsl naming convention
  //==============================================================================
  this.LoadShaders = function(ShaderNames){
    console.group("Shader Compilation");
    ShaderNames.forEach(function(element){
        console.groupCollapsed("Shader: "+element);
        this.Shaders[element] = new Shader(element);
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
      this.Objects[element] = new Object(element);
      console.groupEnd();
    }, this);
    console.groupEnd();
  }
}
