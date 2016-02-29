const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
var path = require('path');
var _ = require('lodash');
var pingMetrics = require('ping-metrics');

var trayApp = null;
var ping = null;

// IPs from https://support.riotgames.com/hc/en-us/articles/201752674-Network-System-and-League-of-Legends-Logs
var servers = {
  NA: "104.160.131.1",
  EUW: "185.40.65.1",
  EUNE: "31.186.224.42",
  OCE: "103.240.227.5",
  BR: "8.23.24.4",
  LAN: "66.151.33.33",
  LAS: "138.0.12.100",
  TR: "31.186.226.34"
};
var currentIp = servers.NA;

var imagePath = function(filename) {
  return path.join(__dirname, 'images', filename);
};

var quit = function() {
  app.quit();
};

var changeServer = function(server) {
  var newIp = servers[server];
  if (newIp === currentIp) {
    return;
  }
  currentIp = newIp;
  startPing();
};

var startPing = function() {
  if (ping) {
    ping.stop();
  }
  ping = pingMetrics({ip: currentIp, interval: 1000, numIntervals: 60}, function(metrics) {
    console.log("PING:", currentIp, metrics.ping);
    if (metrics.ping < 50) {
      trayApp.setImage(imagePath('IconTemplate.png'));
    }
    else if (metrics.ping < 120) {
      trayApp.setImage(imagePath('IconTemplate2.png'));
    }
    else {
      trayApp.setImage(imagePath('IconTemplate3.png'));
    }
  });
  ping.run();
};

app.dock.hide();
app.on('ready', function(){
  trayApp = new Tray(imagePath('IconTemplate.png'));
  var contextMenuTemplate = [];
  for(var server in servers) {
    var onClick = (function(server) {
      return function(){ changeServer(server); }
    })(server);
    contextMenuTemplate.push({
      label: server,
      type: 'radio',
      click: onClick
    });
  }
  contextMenuTemplate.push({type: 'separator'});
  contextMenuTemplate.push({label: 'Quit', type: 'normal', click: quit});
  var currentServerItemIndex = _.findIndex(contextMenuTemplate, function(item) {
    return servers[item.label] === currentIp;
  });
  contextMenuTemplate[currentServerItemIndex].checked = true;
  var contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

  trayApp.setToolTip('This is my application.');
  trayApp.setContextMenu(contextMenu);
  startPing();
});
