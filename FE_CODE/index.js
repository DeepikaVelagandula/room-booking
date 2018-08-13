angular.module("myapp", ['ui.router','loginModule','RoomBookingModule']).config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('login');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: './html/login.html'
        })
        .state('roomBookingApp', {
            url: '/roomBookingApp',
            templateUrl: './../html/roomBookingApp.html'
        });            
});

angular.bootstrap(document.getElementById('myNgApp'), ['myapp']);



























