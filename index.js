const {app} = require("electron");
const {ipcMain} = require('electron');
const windowCreator = require(__dirname+"/windowCreator.js");
let mainWindow;
var path = require('path');
var appDir = path.dirname(require.main.filename);
function init(){
	mainWindow = windowCreator.create(appDir+'\\GUI\\');
	ipcMain.on('createWindow', (event, arg) => {
	  windowCreator.create(appDir+arg);
	})
}

app.on('ready', function(){
	init();
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (mainWindow === null) {
		init();
  }
})
