const {app} = require("electron");
var path = require('path');
var appDir = path.dirname(require.main.filename);
function init(){
	require(__dirname+"/windowCreator.js").create(appDir+'\\GUI\\');
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
