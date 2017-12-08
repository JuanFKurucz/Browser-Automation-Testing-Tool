const {app} = require("electron");
const windowCreator = require(__dirname+"/windowCreator.js");
let mainWindow;

function init(){
	mainWindow = windowCreator.create(__dirname+'/config.json');
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
