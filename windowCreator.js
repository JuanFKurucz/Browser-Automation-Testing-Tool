const {BrowserWindow} = require("electron");

function createWindow(data){
  let mainWindow = new BrowserWindow(
    {
      title:data.title,
      width: data.width,
      height: data.height,
      webPreferences: {
        preload:data.script
      }
    }
  )
  return mainWindow
}

exports.create=function(data){
  return createWindow(data);
}
