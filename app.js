const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
var path = require('path');

var imagePath = function(filename) {
  return path.join(__dirname, 'images', filename);
};

var quit = function() {
  app.quit();
};

var trayApp = null;
app.dock.hide();
app.on('ready', function(){
  trayApp = new Tray(imagePath('IconTemplate.png'));
  var contextMenu = Menu.buildFromTemplate([
    {label: 'Quit', type: 'normal', click: quit}
  ]);
  trayApp.setToolTip('This is my application.');
  trayApp.setContextMenu(contextMenu);
});
