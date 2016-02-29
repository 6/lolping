const ipcRenderer = require('electron').ipcRenderer;

angular.module('app', []).controller('SettingsController', ['$scope', '$log', function($scope, $log) {
  $scope.save = function() {
    // TODO: do something here
    $scope.close();
  };

  $scope.close = function() {
    ipcRenderer.send('settings.close');
  };
}]);
