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
  this.Textures = {};
  this.Fonts = {};
  this.Extensions = {};
  this.World = {};
  this.Cameras = [];
  this.AnimPlayer = new AnimPlayer();
  //==============================================================================
  //Initializes the Graphics Engine
  //==============================================================================
  this.init = function(){
    canvas = document.getElementById('WebGL', {antialias:true});
    try{
      gl = canvas.getContext("experimental-webgl");
      //Extensions====================================================================
      this.Extensions.aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      //==============================================================================
      //Event Listeners here==========================================================
      document.addEventListener("visibilitychange", Engine.pause, false);
      //==============================================================================
      this.LoadShaders(['Unlit']);
      this.LoadMeshData(['Monkey']);
      this.LoadExtraTex(['CalibriWhite', 'VerdanaWhite']);
      Engine.Fonts['Calibri'] = new fontInfo('Calibri');
      Engine.Fonts['Verdana'] = new fontInfo('Verdana');
      this.Cameras.push(new Camera(this.Cameras.length));
      this.Cameras[0].transform.position = vec3.fromValues(0,0,3);
      this.Matrices.ModelMatrix = mat4.create();
      this.Matrices.NormalMatrix = mat4.create();
      this.Matrices.MVPMatrix = mat4.create();
      this.Matrices.TempMatrix = mat4.create();
      gl.clearColor(0.3,0.3,0.3,1);
      gl.enable(gl.CULL_FACE);
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
    if(Engine.World.hasOwnProperty(obj) && Engine.World[obj].Buffer.position != null){
      //Pop fresh model and mvp Matrices
      Engine.Matrices.MVPMatrix = Engine.MatStack.pop();
      Engine.Matrices.ModelMatrix = Engine.MatStack.pop();
      Engine.MatStack.push(Engine.Matrices.ModelMatrix);
      Engine.MatStack.push(Engine.Matrices.MVPMatrix);
      //Create an alias for the current object
      var obj = Engine.World[obj];
      //Set shader for current object
      gl.useProgram(Engine.Shaders[obj.Shader].Program);
      //Perform per object transformations here
      if(obj.parent == null){
        obj.transform.apply(Engine.Matrices.ModelMatrix);
      }
      else{
        Engine.evalParent(obj);
      }
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
      gl.bindTexture(gl.TEXTURE_2D, obj.Textures.diffuse);
      gl.uniform1i(Engine.Shaders[obj.Shader].Uniforms.u_Sampler, 0);
      gl.uniformMatrix4fv(Engine.Shaders[obj.Shader].Uniforms.u_MVPMatrix, false, Engine.Matrices.MVPMatrix);
      //Draw
      if(obj.type == 'obj'){
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.depthMask(true);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  obj.Buffer.Index);
        gl.drawElements(gl.TRIANGLES, obj.Buffer.Index.numVerts, gl.UNSIGNED_SHORT, 0);
      }
      else if (obj.type == 'text'){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        gl.drawArrays(gl.TRIANGLES, 0, obj.numVerts);
      }
    }}
  }
  //==============================================================================
  //Primary render loop
  //Avoid all 'this' references, as this function uses a callback
  //==============================================================================
  var inter = window.performance.now();
  this.Update = function(){
    var begin = window.performance.now();
    inter = window.performance.now() - inter;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewportWidth = window.innerWidth;
    gl.viewportHeight = window.innerHeight;
    //Call any runtime logic here
    frame = requestAnimationFrame(Engine.Update, canvas);
    Engine.renderFrame();
    Engine.TimeKeeper.update();
    Engine.AnimPlayer.update();
    Engine.TimeKeeper.frameTime = (window.performance.now()-begin).toFixed(2);
    Engine.TimeKeeper.interFrameTime = inter.toFixed(2);
    inter = window.performance.now();
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
  //==============================================================================
  //Dowload and bind extra textures form server
  //==============================================================================
  this.LoadExtraTex = function(TexNames){
    TexNames.forEach(function(element){
      LoadTex(("Resources/Textures/"+element+".png"), element, Engine);
    }, this);
  }
  //==============================================================================
  //Pause the engine when window has lost focus
  //==============================================================================
  this.pause = function(){
    if(document.hidden){
      console.log("Paused");
      cancelAnimationFrame(frame);
    }
    else{
      console.log("Resumed");
      Engine.TimeKeeper.lastFrame = Date.now();
      requestAnimationFrame(Engine.Update, canvas);
    }
  }
  //==============================================================================
  //Take an object and instance it into the world
  //==============================================================================
  this.Instantiate = function(obj, trans = null){
    var instanceName = (obj.tag)+((obj.instances)++).toString();
    this.World[instanceName] = this.Duplicate(obj, instanceName, trans);
    return instanceName;
  }
  //==============================================================================
  //Duplicate an object. Return duplicate.
  //==============================================================================
  this.Duplicate = function(obj, name, trans){
    var newObj = new ObjInst(name);
    newObj.Buffer = obj.Buffer;
    newObj.Textures = obj.Textures;
    if(trans != null){newObj.transform.copy(trans);}
    else{newObj.transform.copy(obj.transform);}
    newObj.Shader = obj.Shader;
    newObj.initialized = true;
    return newObj;
  }
  //==============================================================================
  //recursive function to evaluate an object's tranform based on its parent
  //==============================================================================
  this.evalParent = function(obj){
    if(obj.parent != null){
      this.evalParent(obj.parent);
    }
    obj.transform.apply(Engine.Matrices.ModelMatrix);
  }
}
