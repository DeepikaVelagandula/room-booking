
angular.module("loginModule",['serviceModule']).controller("loginController", loginController);
function loginController(httpServicesData, $state){
    var self = this;
    self.userName = "Admin";
    self.password = "Admin@123";
    function init(){
        httpServicesData.getSession().then(successcallback, function(){});
    }

    self.formSubmit = function(){
        httpServicesData.loginDetils(self.userName, self.password).then(successcallback, failurecallback)       
    }
    
    function successcallback(){
        $state.go('roomBookingApp');  
    }

    function failurecallback(){
        alert("login failure");
    }

    init();
}