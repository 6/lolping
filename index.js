const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const low = require('lowdb')
var path = require('path');
var _ = require('lodash');
var pingMetrics = require('ping-metrics');

const storage = require('lowdb/file-sync');
var dbPath = path.join(app.getPath('userData'), 'db.json');
console.log("Storing settings at:", dbPath);
const db = low(dbPath, {storage});
var trayApp = null;
var ping = null;

// IPs from https://support.riotgames.com/hc/en-us/articles/201752674-Network-System-and-League-of-Legends-Logs
var servers = {
  NA: "104.160.131.1",
  EUW: "185.40.65.1",
  EUNE: "64.7.194.1",
  OCE: "203.174.139.185"
};

var imagePath = function(filename) {
  return path.join(__dirname, 'images', filename);
};

var quit = function() {
  app.quit();
};

var setDefaultSettings = function() {
  if (!currentServer()) {
    setServer("NA");
  }
};

var currentServer = function() {
  var server = db('settings').find({name: 'server'});
  return server ? server.value : null;
};

var setServer = function(server) {
  if (!currentServer()) {
    db('settings').push({name: 'server'});
  }
  db('settings').chain().find({name: 'server'}).assign({value: server}).value();
};

var onChangeServer = function(server) {
  if (server === currentServer()) {
    return;
  }
  setServer(server);
  startPing();
};

var startPing = function() {
  if (ping) {
    ping.stop();
  }
  var ip = servers[currentServer()];
  ping = pingMetrics({ip: ip, interval: 1000, numIntervals: 60}, function(metrics) {
    console.log("PING:", ip, metrics.ping);
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
  setDefaultSettings();
  trayApp = new Tray(imagePath('IconTemplate.png'));
  var contextMenuTemplate = [];
  for(var server in servers) {
    var onClick = (function(server) {
      return function(){ onChangeServer(server); }
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
    return item.label === currentServer();
  });
  contextMenuTemplate[currentServerItemIndex].checked = true;
  var contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

  trayApp.setToolTip('This is my application.');
  trayApp.setContextMenu(contextMenu);
  startPing();
});
