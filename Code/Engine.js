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
  this.Shaders = {};
  this.Objects = [];
  //==============================================================================
  //Initializes the Graphics Engine
  //==============================================================================
  this.init = function(){
    canvas = document.getElementById('WebGL');
    try{
      gl = canvas.getContext("experimental-webgl");
      this.LoadShaders(['Standard']);
      this.LoadMeshData(['Monkey']);
      this.Matrices.ModelMatrix = mat4.create();
      this.Matrices.NormalMatrix = mat4.create();
      this.Matrices.MVPMatrix = mat4.create();
      gl.clearColor(0.3,0.3,0.3,1);
      gl.enable(gl.DEPTH_TEST);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewportWidth = window.innerWidth;
      gl.viewportHeight = window.innerHeight;
      gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
  //==============================================================================
   this.renderFrame = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    mat4.lookAt(Engine.Matrices.ModelMatrix, vec3.fromValues(0,0,3), vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));
    mat4.perspective(Engine.Matrices.MVPMatrix, 70, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0);
    mat4.multiply(Engine.Matrices.MVPMatrix, Engine.Matrices.MVPMatrix, Engine.Matrices.ModelMatrix);
    mat4.identity(Engine.Matrices.ModelMatrix);
    mat4.rotateY(Engine.Matrices.ModelMatrix, Engine.Matrices.ModelMatrix, tempRot);
    mat4.multiply(Engine.Matrices.MVPMatrix, Engine.Matrices.MVPMatrix, Engine.Matrices.ModelMatrix);

    gl.uniformMatrix4fv(Engine.Shaders.Standard.Uniforms.u_MVPMatrix, false, Engine.Matrices.MVPMatrix);

    Engine.Objects.map(function(obj){
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.position);
      gl.vertexAttribPointer(Engine.Shaders.Standard.Attributes.a_Position, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.uv);
      gl.vertexAttribPointer(Engine.Shaders.Standard.Attributes.a_UV, 2, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.normal);
    // gl.vertexAttribPointer(Engine.Shaders.Standard.Attributes.a_Normal, 3, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, obj.Textures[0]);
      gl.uniform1i(Engine.Shaders.Standard.Uniforms.u_Sampler, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  obj.Buffer.Index);

      gl.drawElements(gl.TRIANGLES, obj.Buffer.Index.numVerts, gl.UNSIGNED_SHORT, 0);
    });
  }
  //==============================================================================
  //Primary render loop
  //==============================================================================
  this.Update = function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewportWidth = window.innerWidth;
    gl.viewportHeight = window.innerHeight;
    //Call any runtime logic here
    requestAnimationFrame(Engine.Update, canvas);
    tempRot+=(0.5*Engine.TimeKeeper.deltaTime)/1000.0;
    tempRot = tempRot%6.28318;
    Engine.renderFrame();
    Engine.TimeKeeper.update();
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
      this.Objects.push(new Object(element));
      console.groupEnd();
    }, this);
    console.groupEnd();
  }
}
