const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
var path = require('path');

var trayApp = null;
var pingMenuItem = null;
var ips = {
  NA: "104.160.131.1",
  EUW: "185.40.65.1"
};
var currentIp = ips.NA;

var imagePath = function(filename) {
  return path.join(__dirname, 'images', filename);
};

var quit = function() {
  app.quit();
};

var changeIp = function(serverLocation) {
  var newIp = ips[serverLocation];
  if (newIp === currentIp) {
    return;
  }
  currentIp = newIp;
  console.log("NEW IP", newIp);
};

app.dock.hide();
app.on('ready', function(){
  trayApp = new Tray(imagePath('IconTemplate.png'));
  var contextMenuTemplate = [];
  for(var serverLocation in ips) {
    var onClick = (function(serverLocation) {
      return function(){ changeIp(serverLocation); }
    })(serverLocation);
    contextMenuTemplate.push({
      label: serverLocation,
      type: 'radio',
      click: onClick
    });
  }
  contextMenuTemplate.push({type: 'separator'});
  contextMenuTemplate.push({label: 'Quit', type: 'normal', click: quit});
  var contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

  trayApp.setToolTip('This is my application.');
  trayApp.setContextMenu(contextMenu);
});
