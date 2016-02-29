const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
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
var settingsWindow = null;

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

var openSettings = function() {
  settingsWindow.show();
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
  console.log("Pinging:", ip);
  ping = pingMetrics({ip: ip, interval: 1000, numIntervals: 60}, function(metrics) {
    console.log([
      "Current: " + metrics.ping,
      "Avg: " + Math.round(metrics.average),
      "Stdev: " + Math.round(metrics.standardDeviation)
    ].join(" "));

    if (metrics.average >= 120 || metrics.standardDeviation >= 30 || metrics.loss > 0) {
      trayApp.setImage(imagePath('Icon3.png'));
    }
    else if (metrics.average >= 80 || metrics.standardDeviation >= 15) {
      trayApp.setImage(imagePath('Icon2.png'));
    }
    else {
      trayApp.setImage(imagePath('Icon1.png'));
    }
  });
  ping.run();
};

app.dock.hide();
ipcMain.on('settings.close', function(event, arg) {
  settingsWindow.hide();
});
app.on('ready', function(){
  setDefaultSettings();
  settingsWindow = new BrowserWindow({width: 500, height: 300, show: false, frame: false});
  settingsWindow.loadURL('file://' + path.join(__dirname, 'ui', 'settings', 'settings.html'));
  trayApp = new Tray(imagePath('Icon1.png'));
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
  contextMenuTemplate.push({label: 'Settings', type: 'normal', click: openSettings});
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
