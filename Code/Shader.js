//==============================================================================
//SHADER OBJECT
//Contains Compiled Shader And A Tag.
//==============================================================================
function Shader(name, gl){
  this.Program = gl.createProgram();
  this.Attributes = {};
  this.Uniforms ={};

  var vShader = Parse("Shaders/"+name+"_v.glsl", gl);
  var fShader = Parse("Shaders/"+name+"_f.glsl", gl);

  if(fShader == null || vShader == null){
    console.log("Shaders failed to compile.");
    return null;
  }

  gl.attachShader(this.Program, vShader);
  gl.attachShader(this.Program, fShader);
  gl.linkProgram(this.Program);

  console.group("Attributes/Uniforms");
  //Load Shader Source
  var fShaderSource = gl.getShaderSource(fShader);
  var vShaderSource = gl.getShaderSource(vShader);
  //RegExp for determining attribute names
  var MatchAttrib = /attribute (.+\b) (\w+)/gi;
  var MatchAttribName =  / .+\b (.+)/i;
  //Find each Attribute
  var vAttribs = vShaderSource.match(MatchAttrib);
  //For each attribute, find name and initialize
  console.log("Vertex Attributes:");
  vAttribs.forEach(function(element){
    let split = element.match(MatchAttribName);
    try{this.Attributes[split[1]] = gl.getAttribLocation(this.Program, split[1]);
    gl.enableVertexAttribArray(this.Program[split[1]]);}
    catch(e){
      console.log(e);
    }
    console.log("Enabled vert attrib: "+split[1]);
  }, this);

  //RegExp for determining Uniform names
  var MatchUni = /uniform (.+\b) (.+);/gi;
  var MatchUniName = / (.+\b) (\w+).?(\d+)*.?/i;
  //Find each uniform
  var vUniforms = vShaderSource.match(MatchUni);
  var fUniforms = fShaderSource.match(MatchUni);
  //For each uniform in vertex shader, find name and init
  console.log("\nVertex Uniforms:");
  vUniforms.forEach(function(element){
    let split = element.match(MatchUniName);
    if(split[3] != undefined){
      //Skip this for now since its an array Uniform
    }
    else{
      this.Uniforms[split[2]] = gl.getUniformLocation(this.Program, split[2]);
      console.log("Saved uniform location: "+split[2]);
    }
  }, this);
  //For each uniform in fragment shader, find name and init
  console.log("\nFragment Uniforms:");
  if(fUniforms != null){
    fUniforms.forEach(function(element){
      let split = element.match(MatchUniName);
      if(split[3]!=undefined){
        //Skip this for now since its an array uniform.
      }
      else{
        //Check to see if the uniform has been added by the vertex shader.
        if(this.Uniforms[split[2]]==undefined){
          this.Uniforms[split[2]] = gl.getUniformLocation(this.Program, split[2]);
          console.log("Saved uniform location: "+split[2]);
        }
      }
    }, this);
  }
  else{
    console.log("No fragment uniforms.\n\n");
  }
  console.groupEnd();
}
//==============================================================================
//Load code from server and compile
//==============================================================================
function Parse(url, gl){
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  req.send();

  console.groupCollapsed("GLSL Body");
  console.log(req.responseText);
  console.groupEnd();
  if(req.status === 200){
    var glShader;
    if(url.includes("_f.glsl")){
      console.log("Fragment Shader compilation started...");
      glShader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if(url.includes("_v.glsl")){
      console.log("Vertex Shader compilation started...");
      glShader = gl.createShader(gl.VERTEX_SHADER);
    }
    else{
      console.log("Shader not found in file.");
      return null;
    }
    gl.shaderSource(glShader, req.responseText);
    gl.compileShader(glShader);

    if(!gl.getShaderParameter(glShader, gl.COMPILE_STATUS)){
      console.log("Failed to compile shader.");
      return null;
    }
    console.log("Shader compilation complete.\n\n");
    return glShader;
  }
  else{
    console.log("Failed to load shader code from server.\n");
    return null;
  }
}
