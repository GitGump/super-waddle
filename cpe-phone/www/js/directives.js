angular.module('cpe-phone.directives', ['cpe-phone.services'])

.directive('checkLoginUsername', ['checkService',
	function(checkService) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				ctrl.$validators.checkLoginUsername = function(modelName, viewName) {
					if (checkService.isValidUsername(viewName)) {
						return true;
					} else {
						return false;
					}
				};
			}
		};
	}
])

.directive('checkLoginPassword', ['checkService',
	function(checkService) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				ctrl.$validators.checkLoginPassword = function(modelName, viewName) {
					if (checkService.isValidPassword(viewName)) {
						return true;
					} else {
						return false;
					}
				};
			}
		};
	}
])

.directive('checkLanIp', ['checkService',
	function(checkService) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				ctrl.$validators.checkLanIp = function(modelName, viewName) {
					if (checkService.isValidIp(viewName)) {
						return true;
					} else {
						return false;
					}
				};
			}
		};
	}
])

.directive('checkLanMask', ['checkService',
	function(checkService) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				ctrl.$validators.checkLanMask = function(modelName, viewName) {
					if (checkService.isMask(viewName)) {
						return true;
					} else {
						return false;
					}
				};
			}
		};
	}
])

.directive('checkWirelessSsid', ['checkService',
	function(checkService) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				ctrl.$validators.checkWirelessSsid = function(modelName, viewName) {
					if (checkService.isValidSsid(viewName)) {
						return true;
					} else {
						return false;
					}
				};
			}
		};
	}
])

.directive('checkWirelessKey', ['checkService',
	function(checkService) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				ctrl.$validators.checkWirelessKey = function(modelName, viewName) {
					if (checkService.isValidKey(viewName)) {
						return true;
					} else {
						return false;
					}
				};
			}
		};
	}
])