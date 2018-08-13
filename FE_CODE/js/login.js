
angular.module("loginModule",['serviceModule']).controller("loginController", loginController);
function loginController(httpServicesData, $state){
    var self = this;
    // $rootScope.islogin = false;
    self.userName = "";
    self.password = "";
    function init(){
        httpServicesData.getSession().then(successcallback, function(){});
    }

    self.formSubmit = function(){
        httpServicesData.loginDetils(self.userName, self.password).then(successcallback, failurecallback)       
    }
    function successcallback(response){
        // $rootScope.islogin = true;
        $state.go('roomBookingApp');  
    }

    function failurecallback(){
        alert("login failure");
    }
    init();
}