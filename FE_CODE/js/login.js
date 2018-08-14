
angular.module("loginModule",['serviceModule']).controller("loginController", loginController);
function loginController(httpServicesData, $state, $rootScope){
    var self = this;
    self.userName = "";
    self.password = "";
    function init(){
        httpServicesData.getSession().then(successcallback, function(){});
    }

    self.formSubmit = function(){
        httpServicesData.loginDetils(self.userName, self.password).then(successcallback, failurecallback)       
    }
    
    function successcallback(res){
        $rootScope.isAdmin = res.data.admin;
        $state.go('roomBookingApp');  
    }

    function failurecallback(){
        alert("login failure");
    }

    init();
}