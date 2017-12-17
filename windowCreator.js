const {BrowserWindow} = require("electron");
const {noSpace} = require("./transformName.js");

const fs = require('fs');
function generateScriptFile(title,scripts,folder,callback){
  if(title&&scripts&&folder){
    var text="";
    var folderR=folder.replace(/\\/g,"\\\\");
    if(typeof scripts != "string"){
      for(var i=0;i<scripts.length;i++){
        text+="require('"+folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\")+"');\n";
      }
    } else {
      text+="require('"+folderR+"\\\\"+scripts.replace(/\//g,"\\\\")+"');\n";
    }
    fs.writeFile(folder+"\\"+noSpace(title)+"-script.js",text, function(err) {
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
    obj.folder = folderPath;
    obj.webPreferences.preload=folderPath+"\\"+noSpace(obj.title)+"-script.js";
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
  let window = new BrowserWindow(data);
  if(ValidURL(data.url)){
    window.loadURL(data.url);
  } else {
    window.loadURL(data.folder+data.url);
  }
  if(data.main){
    require(data.folder+"\\"+data.main).init(window);
  }
}

exports.create=function(folderPath){
  var data = readConfig(folderPath,function(data){
    generateScriptFile(data.title,data.scripts,data.folder,function(){
      return createWindow(data);
    });
  });
}
