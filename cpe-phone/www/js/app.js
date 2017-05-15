// Ionic cpe-phone App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'cpe-phone' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'cpe-phone.services' is found in services.js
// 'cpe-phone.controllers' is found in controllers.js
angular.module('cpe-phone', ['ionic', 'cpe-phone.controllers', 'cpe-phone.services', 'cpe-phone.directives', 'ui.router', 'chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(['ChartJsProvider',
  function(ChartJsProvider) {
    ChartJsProvider.setOptions({
      chartColors: ['#ff645d', '#a049cc', '#5165ff'],
      responsive: false
    });
    ChartJsProvider.setOptions('line', {
      showLines: true
    });
  }
])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'pages/login.html',
    controller: 'loginCtrl'
  })

  .state('opmode', {
    url: '/opmode',
    templateUrl: 'pages/opmode.html',
    controller: 'opmodeCtrl'
  })

  .state('lan', {
    url: '/lan',
    templateUrl: 'pages/lan.html',
    controller: 'lanCtrl'
  })

  .state('ap', {
    url: '/ap',
    templateUrl: 'pages/ap.html',
    controller: 'apCtrl'
  })

  .state('client', {
    url: '/client',
    templateUrl: 'pages/client.html',
    controller: 'clientCtrl'
  })

  .state('finish', {
    url: '/finish',
    templateUrl: 'pages/finish.html',
    controller: 'finishCtrl'
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('login');

});
