const {ipcMain} = require('electron');
var path = require('path');
var appDir = path.dirname(require.main.filename);
exports.init=function(window){
  ipcMain.on("createWindow", (event,arg) => {
    console.log(appDir+'/windowCreator.js',appDir+arg)
    require(appDir+'/windowCreator.js').create(appDir+arg);
  })
  ipcMain.on("MinimizeProgram", (event) => {
    window.minimize();
  })
  ipcMain.on("CloseProgram", (event) => {
    window.close();
  })
}
