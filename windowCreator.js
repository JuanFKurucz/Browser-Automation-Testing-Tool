const {BrowserWindow} = require("electron");
const fs = require('fs');
function generateScriptFile(title,scripts,folder,callback){
  var text="";
  for(var i=0;i<scripts.length;i++){
    text+="require('"+folder.replace(/\\/g,"/")+scripts[i].replace(/\\/g,"/")+"');\n";
  }
  fs.writeFile(folder+"/"+title.replace(/ /g,"-")+"-script.js",text, function(err) {
      if(err) {
          return console.log(err);
      }
      callback();
  });
}

function readConfig(configFile,callback){
  fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) throw err;
    var obj=JSON.parse(data);
    obj.folder = configFile.replace("/config.json","");
    callback(obj);
  });
}

function createWindow(data){
  let mainWindow = new BrowserWindow(
    {
      title:data.title,
      width: data.width,
      height: data.height,
      webPreferences: {
        preload:data.folder+"/"+data.title.replace(/ /g,"-")+"-script.js"
      }
    }
  )
  mainWindow.loadURL(data.url);
  return mainWindow
}

exports.create=function(configFile){
  var data = readConfig(configFile,function(data){
    generateScriptFile(data.title,data.scripts,data.folder,function(){
      return createWindow(data);
    });
  });
}
