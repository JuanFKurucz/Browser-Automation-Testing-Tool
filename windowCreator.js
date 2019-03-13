const {BrowserWindow} = require("electron");
const {noSpace} = require("./transformName.js");
const {translateBattFile} = require("./battToJs.js");
const fs = require('fs');

function writeGeneratedScriptFile(folder,title,Iscripts,Itext,callback){
  var text=Itext;
  var folderR=folder.replace(/\\/g,"\\\\");
  var dots=null;
  var scripts=null;
  if(typeof Iscripts =="string"){
    scripts=[];
    scripts.push(Iscripts);
  } else {
    scripts=Iscripts;
  }
  for(var i=0;i<scripts.length;i++){
    dots=scripts[i].split(".");
    if(dots[dots.length-1]==="batt"){
      translateBattFile(folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\"));
      text+="require('"+folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\").replace(".batt","-translated.js")+"').init(globalProject);\n";
    } else if(dots[dots.length-1]==="js"){
      text+="require('"+folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\")+"').init(globalProject);\n";
    }
  }
  text+="}\n}";
  fs.writeFile(folder+"\\"+noSpace(title)+"-script.js",text, function(err) {
      if(err) {
          return console.log(err);
      }
      callback();
  });
}

function generateScriptFile(data,callback){
  if(data.window.title !== undefined&&data.scripts !== undefined&&data.window.folder !== undefined){
    var text="document.onreadystatechange = function () {\nif (document.readyState == '"+data.runat+"') {\n";
    text+="var globalProject=require('"+__dirname.replace(/\\/g,"\\\\")+"\\\\Projects\\\\global.js');\n";
    var iCallback=callback;
    if(data.popup !== undefined){
      iCallback=function(){};
    }
    writeGeneratedScriptFile(data.window.folder,data.window.title,data.scripts,text,iCallback);
    if(data.popup !== undefined){
      writeGeneratedScriptFile(data.window.folder,data.window.title+"-popups",data.popup,text,callback);
    }
  }
}

function readConfig(folderPath,callback,creation=true){
  fs.readFile(folderPath+"\\config.json", 'utf8', function (err, data) {
    if (err) throw err;
    var obj=JSON.parse(data);
    if(creation){
      obj.window.folder = folderPath;
      if(!("battStorage" in obj)){
        obj.battStorage={};
      }
      obj.window.webPreferences.preload=folderPath+"\\"+noSpace(obj.window.title)+"-script.js";
    }
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

  if(data.url!=undefined){
    if(ValidURL(data.url)){
      window.loadURL(data.url);
    } else {
      window.loadURL(data.window.folder+"\\"+data.url);
    }
  }
  window.on('closed', () => {
    var configData=window.getConfig;
    fs.writeFile(configData.window.folder+"\\config.json",JSON.stringify(configData),function(){
      window=null;
    });
  })
  if(data.popup!=undefined){
    var showPopup=true;
    if(data.popupshow!=undefined && data.popupshow==false){
      showPopup=false;
    }
    window.webContents.on('new-window', (event, url) => {
      event.preventDefault()
      const defaultWin=new BrowserWindow(
        {
          width: 800,
          height: 600,
          show:showPopup,
          webPreferences:{
            preload:data.window.folder+"\\"+noSpace(data.window.title)+"-popups-script.js",
            "node-integration": false,
            "webSecurity":false,
            "allowRunningInsecureContent":true
          }
        });
      defaultWin.loadURL(url);
      event.newGuest=defaultWin;
    })
  }
  if(data.main!=undefined){
    require(data.window.folder+"\\"+data.main).init(window);
  }
  return window;
}
exports.readConfig=function(path,callback){
  readConfig(path,callback);
}
exports.create=function(project,callback=null){
  readConfig(project,function(data){
    generateScriptFile(data,function(){
      var window=createWindow(data);
      if(callback!=null){
        callback(window);
      }
    });
  });
}
