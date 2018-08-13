angular.module('meetingDetailsModule', [])
    .controller('MeetingDetailsController', function ($uibModalInstance, $scope) {
        $scope.meetingDetails = {};
        $scope.storeMeetingData = storeMeetingData;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        function storeMeetingData() {
            $uibModalInstance.close($scope.meetingDetails);
        };
       

    });