angular
.module('components', [])
.directive('loginForm', function() {
  return {
    restrict: 'E',
    templateUrl: 'login-form.html',
    controller: function($scope) {
      var validateInput = function() {
        return $scope.username !== undefined && $scope.username !== '' && $scope.password !== undefined && $scope.password !== '';
      }
      $scope.login = function() {
        if(false === validateInput()) {
          $scope.message = 'Missing username or password!';
          return;
        } else {
          $scope.message = '';
        }
      }
    }
  }
});