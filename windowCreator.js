const {BrowserWindow} = require("electron");
const {noSpace} = require("./transformName.js");

const fs = require('fs');

function removeBattTag(command){
  var result=command.substring(command.indexOf("=")+1,command.length);
  if(result[0]==='"'||result[0]==="'"){
    result=result.substring(1,result.length);
  }
  if(result[result.length-1]==='"'||result[result.length-1]==="'"){
    result=result.substring(0,result.length-1);
  }
  return result;
}

function getBattTag(command){
  var index=command.indexOf("=");
  if(index==-1){
    index=command.length
  }
  var result=command.substring(0,index);
  if(result!=result.toUpperCase()){
    result=false;
  }
  return result;
}

function translateBattFile(path){
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) throw err;
    var commands=data.split("\n");
    var c=null;
    var code="exports.init = function(batt){\nvar o=window;\nvar doc=window.document;\n";
    var temp="";
    var insideString=false;
    var endWaits=[];
    for(var i=0;i<commands.length;i++){
      a=commands[i].trim();
      c=[];
      for(var l=0;l<a.length;l++){
        if(insideString==false && a[l]==" "){
          c.push(temp);
          temp="";
        } else {
          temp+=a[l];
          if(a[l]=='"'){
            if(insideString==false){
              insideString=true;
            } else {
              insideString=false;
            }
          }
        }
      }
      if(temp!=""){
        c.push(temp);
        temp="";
      }
      switch(c[0]){
        case "WAITFOR":
          code+='batt.waitForElements(o,["'+removeBattTag(c[1]).split(',').join('","')+'"],'+
                  removeBattTag(c[2])+','+
                  removeBattTag(c[3])+',function(o,doc){';
          break;
        case "FIND":
          var action="";
          switch(getBattTag(c[3])){
            case "CLICK":
              action=".click()"
              break;
            case "VALUE":
              action=".value='"+removeBattTag(c[3])+"'";
              break;
            case "TEXT":
              action=".textContent='"+removeBattTag(c[3])+"'";
              break;
            case "HTML":
              action=".innerHTML='"+removeBattTag(c[3])+"'";
              break;
            case "SETATTR":
              action=".='"+removeBattTag(c[3])+"'";
              break;
          }
          action+=";";
          code+='doc.querySelectorAll("'+removeBattTag(c[1])+'")['+removeBattTag(c[2])+']'+action;
          break;
        case "EXEC":
          code+=removeBattTag(c[1]);
          break;
        case "WAIT":
          code+="setTimeout(function(){";
          endWaits.push((parseFloat(c[1])*1000));
          break;
        case "CLOSE":
          code+="window.close();";
          break;
        case "END":
          switch(getBattTag(c[1])){
            case "WAITFOR":
            //case "CONTROLDOCUMENT":
              code+="});";
              break;
            case "WAIT":
              code+="},"+endWaits.pop()+");";
              break;
          }
      }
      code+="\n";
    }
    code+="}";
    fs.writeFile(path.replace(".batt","-translated.js"),code, function(err) {
        if(err) {
            return console.log(err);
        }
    });
  });
}

function generateScriptFile(data,callback){
  if(data.window.title !== undefined&&data.scripts !== undefined&&data.window.folder !== undefined){
    var text="document.onreadystatechange = function () {\nif (document.readyState == '"+data.runat+"') {\n";
    text+="var globalProject=require('"+__dirname.replace(/\\/g,"\\\\")+"\\\\Projects\\\\global.js');\n"
    var folderR=data.window.folder.replace(/\\/g,"\\\\");
    var dots=null;
    var scripts=null;
    if(typeof data.scripts =="string"){
      scripts=[data.scripts];
    } else {
      scripts=data.scripts;
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
    fs.writeFile(data.window.folder+"\\"+noSpace(data.window.title)+"-script.js",text, function(err) {
        if(err) {
            return console.log(err);
        }
        callback();
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

  if(data.url!=undefined){
    if(ValidURL(data.url)){
      window.loadURL(data.url);
    } else {
      window.loadURL(data.window.folder+"\\"+data.url);
    }
  }
  if(window.getConfig.window.folder!=undefined){
    window.on('closed', () => {
      //window.webContents.session.clearCache(function(){
        fs.writeFile(window.getConfig.window.folder+"\\config.json",JSON.stringify(window.getConfig), function(err) {
            if(err) {
                return console.log(err);
            }
            window = null;

        });
      //});
    })
  } else {
    window.on('closed', () => {
      window.webContents.session.clearCache(function(){
        window = null;
      });
    });
  }

  if(data.main!=undefined){
    require(data.window.folder+"\\"+data.main).init(window);
  }
  return window;
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
