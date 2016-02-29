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

var appIcon = null;
app.dock.hide();
app.on('ready', function(){
  appIcon = new Tray(imagePath('IconTemplate.png'));
  var contextMenu = Menu.buildFromTemplate([
    {label: 'Quit', type: 'normal', click: quit}
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
});
