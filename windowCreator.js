const {BrowserWindow} = require("electron");
const {noSpace} = require("./transformName.js");

const fs = require('fs');
function generateScriptFile(data,callback){
  if(data.window.title !== undefined&&data.scripts !== undefined&&data.window.folder !== undefined){
    var text="document.onreadystatechange = function () {\nif (document.readyState == '"+data.runat+"') {\n";
    text+="var globalProject=require('"+__dirname.replace(/\\/g,"\\\\")+"\\\\Projects\\\\global.js');\n"
    var folderR=data.window.folder.replace(/\\/g,"\\\\");
    if(typeof data.scripts != "string"){
      for(var i=0;i<scripts.length;i++){
        text+="require('"+folderR+"\\\\"+data.scripts[i].replace(/\//g,"\\\\")+"').init(globalProject);\n";
      }
    } else {
      text+="require('"+folderR+"\\\\"+data.scripts.replace(/\//g,"\\\\")+"').init(globalProject);\n";
    }
    text+="}\n}";
    fs.writeFile(data.window.folder+"\\"+noSpace(data.window.title)+"-script.js",text, function(err) {
        if(err) {
            return console.log(err);
        }
        return callback();
    });
  }
}

function readConfig(folderPath,callback){
  fs.readFile(folderPath+"\\config.json", 'utf8', function (err, data) {
    if (err) throw err;
    var obj=JSON.parse(data);
    obj.window.folder = folderPath;
    obj.window.webPreferences.preload=folderPath+"\\"+noSpace(obj.window.title)+"-script.js";
    return callback(obj);
  });
}

function ValidURL(str) {
  //https://stackoverflow.com/a/30229098
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    return false;
  } else {
    return true;
  }
}

function createWindow(data){
  let window = new BrowserWindow(data.window);

  window.getConfig=data;

  if(data.url){
    if(ValidURL(data.url)){
      window.loadURL(data.url);
    } else {
      window.loadURL(data.window.folder+data.url);
    }
  }

  window.on('closed', () => {
    fs.writeFile(window.getConfig.window.folder+"\\config.json",JSON.stringify(window.getConfig), function(err) {
        if(err) {
            return console.log(err);
        }
        window = null
    });
  })

  if(data.main){
    require(data.window.folder+"\\"+data.main).init(window);
  }
}

exports.create=function(folderPath){
  readConfig(folderPath,function(data){
    generateScriptFile(data,function(){
      createWindow(data);
    });
  });
}
