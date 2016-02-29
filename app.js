const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
var path = require('path');

var imagePath = function(filename) {
  return path.join(__dirname, 'images', filename);
};

var appIcon = null;
app.on('ready', function(){
  appIcon = new Tray(imagePath('IconTemplate.png'));
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
});
