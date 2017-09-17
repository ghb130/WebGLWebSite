//==============================================================================
//SHADER OBJECT
//Contains Compiled Shader And A Tag.
//Properties:
//--Program - compiled and linked webGlShader
//--Attributes - object/dictionary of locations of attributes found in the shader
//--Uniforms - object/dictionart of locations of uniforms found in the shader.
//==============================================================================
function Shader(name){
  this.Program = gl.createProgram();
  this.Attributes = {};
  this.Uniforms = {};
  this.compiled = false;
  this.compile(name)
  .then(()=>{this.compiled = true;})
  .catch(()=>{console.log('Failed to compile shader.');});
}
Shader.prototype.compile = async function (name) {
  let vShader =  this.Parse("Shaders/"+name+"_v.glsl", gl);
  let fShader =  this.Parse("Shaders/"+name+"_f.glsl", gl);
  [vShader, fShader] = [await vShader, await fShader];

  console.groupCollapsed("Shader Parsing: " + name);
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
  //==============================================================================
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
    gl.enableVertexAttribArray(this.Attributes[split[1]]);}
    catch(e){
      console.log(e);
    }
    console.log("Enabled vert attrib: "+split[1]);
  }, this);
  //==============================================================================
  //RegExp for finding structs
  var FindStruct = /struct (\w+\b).?{[\s\S]+?};/gi;
  var SplitStruct = /struct (\w+).?{[\s\S]([\s\S]+)+}/i;
  var ParseStruct = /(.+\b) (\w+)/gi;
  var NameField = /(\b.+\b) (\w+)/i;
  //Pre-process struct data
  var vStructs = [];
  var fStructs = [];
  // Find structs in vertex shader and log their info in a struct object
  var index = 0;
  var vStructList = vShaderSource.match(FindStruct);
  if(vStructList != null){
    vStructList.forEach(function(element){
      var sNameBody = element.match(SplitStruct);
      vStructs.push(new Struct(sNameBody[1]));
      (sNameBody[2].match(ParseStruct)).forEach(function(line){
        var fName = line.match(NameField);
        vStructs[index].fields.push(fName[2]);
        vStructs[index].types.push(fName[1]);
      }, this);
      index++;
    }, this);
  }
  // Find structs in fragment shader and log their info in a struct object
  index = 0;
  var fStructList = fShaderSource.match(FindStruct);
  if(fStructList != null){
    fStructList.forEach(function(element){
      var sNameBody = element.match(SplitStruct);
      vStructs.push(new Struct(sNameBody[1]));
      (sNameBody[2].match(ParseStruct)).forEach(function(line){
        var fName = line.match(NameField);
        fStructs[index].fields.push(fName[1]);
      }, this);
      index++;
    }, this);
  }
  //==============================================================================
  //RegExp for determining Uniform names
  var MatchUni = /uniform (.+\b) (.+);/gi;
  var MatchUniName = / (.+\b) (\w+).?(\d+)*.?/i;
  //Find each uniform
  var vUniforms = vShaderSource.match(MatchUni);
  var fUniforms = fShaderSource.match(MatchUni);
  //For each uniform in ---vertex--- shader, find name and init
  console.log("\nVertex Uniforms:");
  vUniforms.forEach(function(element){
    let split = element.match(MatchUniName);
    if(split[3] != undefined){
      console.log("Processing array uniform: "+split[2]);
      console.groupCollapsed("Type Matching");
      //This is an array uniform, so handle accordingly
      let size = parseInt(split[3]);
      this.Uniforms[split[2]] = [];
      Engine.ShaderVars[split[2]] = [];
      let findStruct = true;
      //Iterate over the length of the array
      for(var i = 0; i < size; i++){
        this.Uniforms[split[2]].push({});
        Engine.ShaderVars[split[2]].push({});
        //Look to see if the uniform type matches a struct
        if (findStruct){
          findStruct = false;
          //Iterate over the total number of structs
          for(var j = 0; j < vStructs.length; j++){
            if(split[1] == vStructs[j].name){
              findStruct = true;
              console.log('Matched uniform '+split[2]+'['+i+'] to struct type '+vStructs[j].name);
              //Iterate over all the fields of a given struct
              for(var k = 0; k < vStructs[j].fields.length; k++){
                let uniName = split[2]+'['+i+']'+'.'+vStructs[j].fields[k];
                this.Uniforms[split[2]][i][vStructs[j].fields[k]] = gl.getUniformLocation(this.Program, uniName);
                Engine.ShaderVars[split[2]][i][vStructs[j].fields[k]] = {};
                Engine.ShaderVars[split[2]][i][vStructs[j].fields[k]].value = null;
                Engine.ShaderVars[split[2]][i][vStructs[j].fields[k]].setter = this.varType[vStructs[j].types[k]];
              }
            }
          }
        }
        if(!findStruct){
          //Since no matching struct was found we can assume it's a basic type array
          console.log('Matched uniform '+split[2]+'['+i+']'+' to basic type: '+split[1]);
          let uniName = split[2]+'['+i+']';
          this.Uniforms[split[2]][i] = gl.getUniformLocation(this.Program, uniName);
          Engine.ShaderVars[split[2]][i] = {};
          Engine.ShaderVars[split[2]][i].value = null;
          Engine.ShaderVars[split[2]][i].setter = this.varType[split[1]];
        }
      }
      console.groupEnd();
    }
    else{
      this.Uniforms[split[2]] = {};
      Engine.ShaderVars[split[2]] = {};
      let Struct = false;
      for(var j = 0; j < vStructs.length; j++){
        if(split[1] == vStructs[j].name){
          Struct = true;
          for(var k = 0; k < vStructs[j].fields.length; k++){
            let uniName = split[2]+'.'+vStructs[j].fields[k];
            this.Uniforms[split[2]][vStructs[j].fields[k]] = gl.getUniformLocation(this.Program, uniName);
            Engine.ShaderVars[split[2]][vStructs[j].fields[k]] = {};
            Engine.ShaderVars[split[2]][vStructs[j].fields[k]].value = null;
            Engine.ShaderVars[split[2]][vStructs[j].fields[k]].setter = this.varType[vStructs[j].types[k]];
          }
          console.log("Saved struct uniform location: "+split[2]);
        }
      }
      if(!Struct){
        this.Uniforms[split[2]] = gl.getUniformLocation(this.Program, split[2]);
        Engine.ShaderVars[split[2]] = {};
        Engine.ShaderVars[split[2]].value = null;
        Engine.ShaderVars[split[2]].setter = this.varType[split[1]];
        console.log("Saved uniform location: "+split[2]);
      }
    }
  }, this);
  //For each uniform in ---fragment--- shader, find name and init
  console.log("\nFragment Uniforms:");
  if(fUniforms != null){
    fUniforms.forEach(function(element){
      let split = element.match(MatchUniName);
      if(split[3]!=undefined){
        if(this.Uniforms[split[2]]==undefined){
          console.log("Processing array uniform: "+split[2]);
          console.groupCollapsed("Type Matching");
          //This is an array uniform, so handle accordingly
          let size = parseInt(split[3]);
          this.Uniforms[split[2]] = [];
          Engine.ShaderVars[split[2]] = [];
          let findStruct = true;
          //Iterate over the length of the array
          for(var i = 0; i < size; i++){
            this.Uniforms[split[2]].push({});
            Engine.ShaderVars[split[2]].push({});
            //Look to see if the uniform type matches a struct
            if (findStruct){
              findStruct = false;
              //Iterate over the total number of structs
              for(var j = 0; j < vStructs.length; j++){
                if(split[1] == vStructs[j].name){
                  findStruct = true;
                  console.log('Matched uniform '+split[2]+'['+i+'] to struct type '+vStructs[j].name);
                  //Iterate over all the fields of a given struct
                  for(var k = 0; k < vStructs[j].fields.length; k++){
                    let uniName = split[2]+'['+i+']'+'.'+vStructs[j].fields[k];
                    this.Uniforms[split[2]][i][vStructs[j].fields[k]] = gl.getUniformLocation(this.Program, uniName);
                    Engine.ShaderVars[split[2]][i][vStructs[j].fields[k]] = {};
                    Engine.ShaderVars[split[2]][i][vStructs[j].fields[k]].value = null;
                    Engine.ShaderVars[split[2]][i][vStructs[j].fields[k]].setter = this.varType[vStructs[j].types[k]];
                  }
                }
              }
            }
            if(!findStruct){
              //Since no matching struct was found we can assume it's a basic type array
              console.log('Matched uniform '+split[2]+'['+i+']'+' to basic type: '+split[1]);
              let uniName = split[2]+'['+i+']';
              this.Uniforms[split[2]][i] = gl.getUniformLocation(this.Program, uniName);
              Engine.ShaderVars[split[2]][i] = {};
              Engine.ShaderVars[split[2]][i].value = null;
              Engine.ShaderVars[split[2]][i].setter = this.varType[split[1]];
            }
          }
          console.groupEnd();
        }
      } //
      else{
        //Check to see if the uniform has been added by the vertex shader.
        if(this.Uniforms[split[2]]==undefined){
          this.Uniforms[split[2]] = {};
          Engine.ShaderVars[split[2]] = {};
          let Struct = false;
          for(var j = 0; j < vStructs.length; j++){
            if(split[1] == vStructs[j].name){
              Struct = true;
              for(var k = 0; k < vStructs[j].fields.length; k++){
                let uniName = split[2]+'.'+vStructs[j].fields[k];
                this.Uniforms[split[2]][vStructs[j].fields[k]] = gl.getUniformLocation(this.Program, uniName);
                Engine.ShaderVars[split[2]][vStructs[j].fields[k]] = {};
                Engine.ShaderVars[split[2]][vStructs[j].fields[k]].value = null;
                Engine.ShaderVars[split[2]][vStructs[j].fields[k]].setter = this.varType[vStructs[j].types[k]];
              }
              console.log("Saved struct uniform location: "+split[2]);
            }
          }
          if(!Struct){
            this.Uniforms[split[2]] = gl.getUniformLocation(this.Program, split[2]);
            Engine.ShaderVars[split[2]] = {};
            Engine.ShaderVars[split[2]].value = null;
            Engine.ShaderVars[split[2]].setter = this.varType[split[1]];
            console.log("Saved uniform location: "+split[2]);
          }
        }
      }
    }, this);
  }
  else{
    console.log("No fragment uniforms.\n\n");
  }
  console.groupEnd();
  console.groupEnd();
}
//==============================================================================
//Load code from server and compile
//==============================================================================
Shader.prototype.Parse = async function(url, gl){
  try{
    var shaderCode = await download(url);
  } catch (e) {console.log(e); return null;};
  console.groupCollapsed("Receiving Shader: "+url);
  console.groupCollapsed("GLSL Body");
  console.log(shaderCode);
  console.groupEnd();
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
    console.groupEnd();
    return null;
  }
  gl.shaderSource(glShader, shaderCode);
  gl.compileShader(glShader);

  if(!gl.getShaderParameter(glShader, gl.COMPILE_STATUS)){
    console.log("Failed to compile shader.");
    console.groupEnd();
    return null;
  }
  console.log("Shader compilation complete.\n\n");
  console.groupEnd();
  return glShader;
}
//==============================================================================
//dictionary for determining the proper setter for a variable type
//==============================================================================
Shader.prototype.varType = {
  'bool': 'uniform1i',
  'int': 'uniform1i',
  'uint': 'uniform1ui',
  'float': 'uniform1f',
  'double': 'uniform1d',
  'bvec2': 'uniform2iv',
  'bvec3': 'uniform3iv',
  'bvec4': 'uniform4iv',
  'ivec2': 'uniform2iv',
  'ivec3': 'uniform3iv',
  'ivec4': 'uniform4iv',
  'uvec2': 'uniform2uiv',
  'uvec3': 'uniform3uiv',
  'uvec4': 'uniform4uiv',
  'vec2': 'uniform2fv',
  'vec3': 'uniform3fv',
  'vec4': 'uniform4fv',
  'dvec2': 'uniform2dv',
  'dvec3': 'uniform3dv',
  'dvec4': 'uniform4dv',
  'mat2': 'uniformMatrix2fv',
  'mat3': 'uniformMatrix3fv',
  'mat4': 'uniformMatrix4fv',
  'sampler2D': 'uniform1i'
};
//==============================================================================
//Supportive struct object.
//Maintains information about a struct in a shader
//==============================================================================
function Struct(name){
  this.name = name;
  this.fields = [];
  this.types = [];
}
