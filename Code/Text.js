//==============================================================================
//2D Text Handler
//Manages the creation of geometry to display text generated from a font texture atlas
//==============================================================================
function Text2D(text, font, color, scale = 1){
  this.Buffer = {};
  this.Buffer.position = gl.createBuffer();
  this.Buffer.normal = gl.createBuffer();
  this.Buffer.uv = gl.createBuffer();
  this.Textures = {};
  this.Textures.Diffuse = Engine.Textures[font+color];
  var scale = 2/canvas.height*scale;
  this.transform = new Transform(undefined, vec3.fromValues(scale, scale, 1), undefined);
  this.Shader = 'Unlit';
  this.type = 'text';
  this.numVerts = 0;
  this.text = text;
  this.font = font;
  this.initialized = true;
  this.parent = null;
  this.color = color;
  this.rebuild();
}
//==============================================================================
//Function to build geometry for the text
//==============================================================================
Text2D.prototype.rebuild = function () {
  var len = this.text.length;
  this.numVerts = len * 6;
  var pos = new Float32Array(this.numVerts*3);
  //var norm = new Float32Array(this.numVerts*3);
  var uv = new Float32Array(this.numVerts*2);
  var offsetPos = 0;
  var offsetUV = 0;
  var x = 0;
  var xLim = Engine.Fonts[this.font].texWidth;
  var yLim = Engine.Fonts[this.font].texHeight;
  var size = Engine.Fonts[this.font].size;
  var line = 0;
  for (var i = 0; i < len; i++){
    var letter = this.text[i];
    if(letter == "\n"){
      x = 0;
      line++;
      i++;
      i++;
    }
    else if (letter == "  ") {
      x += Engine.Fonts[this.font][" "].width;
      x += Engine.Fonts[this.font][" "].width;
    }
    else{
      var letterInfo = Engine.Fonts[this.font][letter];
      if(letterInfo){
        var x2 = x + letterInfo.width;
        var u1 = letterInfo.x / xLim;
        var v1 = (letterInfo.y + size) / yLim;
        var u2 = (letterInfo.x + letterInfo.width) / xLim;
        var v2 = letterInfo.y / yLim;

        pos[offsetPos + 0] = x;
        pos[offsetPos + 1] = 0 + size*line*-.8;
        pos[offsetPos + 2] = 0;
        uv[offsetUV + 0] = u1;
        uv[offsetUV + 1] = v1;

        pos[offsetPos + 3] = x2;
        pos[offsetPos + 4] = 0 + size*line*-.8;
        pos[offsetPos + 5] = 0;
        uv[offsetUV + 2] = u2;
        uv[offsetUV + 3] = v1;

        pos[offsetPos + 6] = x;
        pos[offsetPos + 7] = size + size*line*-.8;
        pos[offsetPos + 8] = 0;
        uv[offsetUV + 4] = u1;
        uv[offsetUV + 5] = v2;

        pos[offsetPos + 9] = x;
        pos[offsetPos + 10] = size + size*line*-.8;
        pos[offsetPos + 11] = 0;
        uv[offsetUV + 6] = u1;
        uv[offsetUV + 7] = v2;

        pos[offsetPos + 12] = x2;
        pos[offsetPos + 13] = 0 + size*line*-.8;
        pos[offsetPos + 14] = 0;
        uv[offsetUV + 8] = u2;
        uv[offsetUV + 9] = v1;

        pos[offsetPos + 15] = x2;
        pos[offsetPos + 16] = size + size*line*-.8;
        pos[offsetPos + 17] = 0;
        uv[offsetUV + 10] = u2;
        uv[offsetUV + 11] = v2;

        x += letterInfo.width + Engine.Fonts[this.font].spacing;
        offsetPos += 18;
        offsetUV += 12;
      }
      else {
        x += Engine.Fonts[this.font][" "].width;
      }
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer.position);
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer.uv);
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
};
//==============================================================================
//set uniforms and draw settings
//==============================================================================
Text2D.prototype.draw = function () {
  setUni(this.Shader, this);
  gl.enable(gl.BLEND);
  gl.disable(gl.CULL_FACE);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);
  gl.drawArrays(gl.TRIANGLES, 0, this.numVerts);
};
//==============================================================================
//Object containing information about our glyph texture. Assumes all glyphs follow same formatting
var widths = {"Calibri": [22, 32, 39, 49, 50, 70, 67, 22, 30, 30, 49, 49, 24,
                          30, 25, 38, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
                          26, 26, 49, 49, 49, 45, 88, 57, 53, 52, 60, 48, 45,
                          62, 61, 25, 31, 51, 41, 84, 63, 65, 51, 66, 53, 45,
                          48, 63, 56, 87, 51, 48, 46, 30, 38, 30, 49, 49, 29,
                          47, 51, 41, 51, 49, 30, 46, 51, 22, 23, 45, 22, 78,
                          51, 52, 51, 51, 34, 38, 33, 51, 44, 70, 42, 44, 39,
                          31, 45, 31, 49],
              "Verdana": [35, 39, 45, 81, 63, 107, 72, 27, 45, 45, 63, 81, 36,
                          45, 36, 45, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63,
                          45, 45, 81, 81, 81, 54, 99, 68, 68, 69, 76, 63, 57,
                          77, 74, 42, 45, 69, 55, 83, 74, 78, 60, 78, 69, 68,
                          61, 72, 68, 98, 68, 61, 68, 45, 45, 45, 81, 63, 63,
                          59, 62, 52, 62, 59, 35, 62, 63, 27, 34, 59, 27, 96,
                          63, 60, 62, 62, 42, 52, 39, 63, 59, 81, 59, 59, 52,
                          63, 45, 63, 81],};
//==============================================================================
function fontInfo(fontName){
  this.size = 136;
  this.texWidth = 2048;
  this.texHeight = 2048;
  this.spacing = 0;
  for (var i=32; i<127;i++) {
    var letter = String.fromCharCode(i);
    this[letter] = {};
    var index = i - 32;
    var xIndex = index%15;
    var yIndex = Math.floor(index/15);
    this[letter].x = xIndex*this.size;
    this[letter].y = yIndex*this.size;
    this[letter].width = widths[fontName][index];
  }
}
