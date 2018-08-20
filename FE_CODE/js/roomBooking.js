
angular.module("RoomBookingModule", [
    'ui.bootstrap',
    'serviceModule',
    'timeChangeFilter',
    'meetingDetailsModule',
    'gm.datepickerMultiSelect'
])
    .controller("roomBookingController", roomBookingController);

function roomBookingController(httpServicesData, $q, $uibModal, $scope, $filter, $state) {
    
    var self = this;  
    //self.isAdmin = $rootScope.isAdmin;
    //console.log(self.isAdmin);

    function deleteRoomReservation(room, slot){       
        var confirmationMessage = confirm("Do you want to delete the booking slot.");
        if(confirmationMessage == true){
            httpServicesData.deleteBookingRoomSlot(self.formattedDate, room, slot).then(function(res){
                self.bookedMeetings = res.data;
                alert("successfully deleted.");
            },function(){
                alert("please delete once again.");
            });
        }        
    }

    self.popover = {
        templateUrl:  "./html/meetingInfoPopOver.html",
        title: "Meeting Details",
        placement: "bottom-left"
    }
    self.roomPopOver = {
        templateUrl:  "./html/roomDetails.html",
        title: "Room Details",
        placement: "bottom-right" 
    }

    function getRoomAvailability() {
        httpServicesData.roomBookingDetailsService(self.formattedDate).then(function (res) {
            self.bookedMeetings = res.data;
        }, function () { 
            self.bookedMeetings = {};
        });
    }

    function bookSlot(room, slot) {
        if (self.bookedMeetings
            && self.bookedMeetings[room.id]
            && self.bookedMeetings[room.id][slot.id]) { 
                alert('current slot is already booked, please choose another');
                return;
        }
        self.reservationData[room.id] = self.reservationData[room.id] || {};

        if (self.reservationData[room.id][slot.id]) {
            delete self.reservationData[room.id][slot.id];
        } else {
            self.reservationData[room.id][slot.id] = {};
        }
    }

    function clearSelection() {
        self.reservationData = {};
    }

    function doReservation(dates) {
        var formattedDates = [];
        if (dates){
            angular.forEach(dates, function(selectedDate, key){
                var formattedDate = $filter('date')(selectedDate, 'dd-MM-yyyy');
                formattedDates.push(formattedDate); 
            })
        }

        if (Object.keys(self.reservationData).length === 0) {
            alert('Please select a time slot to do booking');
            return;
        }

        var modalInstance = $uibModal.open({
            animation: true,
            size: 'lg',
            templateUrl: './html/meeting-details.html',
            controller: 'MeetingDetailsController'
        });

        modalInstance.result.then(function (selectedItem) {
            self.meetingDetails = selectedItem;
            for (var room in self.reservationData) {
                if (self.reservationData.hasOwnProperty(room)) {
                    for (var slot in self.reservationData[room]) {
                        if (self.reservationData[room].hasOwnProperty(slot)) {
                            self.reservationData[room][slot] = self.meetingDetails;
                        }
                    }
                }
            }
           // console.log(self.reservationData)
            httpServicesData.requestingRoomBookingService(formattedDates, self.reservationData).then(successRoomBookingObj, errorBookingSlots);

        }, function () {
            //alert('Meeting details are required to do booking');
        });

    }
    function errorBookingSlots(err) {
        alert('rooms are booked already. Please try for another room.')
    }

    function successRoomBookingObj(res) {
        self.reservationData = {};
        self.bookedMeetings = res.data;
        alert('user successfully booked the slots.')
    }

    // Watching Calander ng-model value to find change in date
    $scope.$watch(function() {
        return self.selectedDate;
    }, function (newValue, oldValue) {
        // If user selected a new date or if the application is loading first time
        if ( newValue && (newValue != oldValue || self.formattedDate === null)){
            var formattedDate = $filter('date')(newValue, 'dd-MM-yyyy'); 
            if(self.formattedDate !== formattedDate){
                self.formattedDate = formattedDate;
                self.reservationData = {};
                self.bookedMeetings = {};
                getRoomAvailability(); // On date change get changed date information
            }
        } 
    });

    self.logout = function(){
        httpServicesData.deleteSession().then(successfulLogOut,function(){
            console.log("log out not working")
        });
    }
    function successfulLogOut(){
        $state.go('login');
    }


    function init(res) {
        self.isAdmin = res.data.admin;
        self.datePickerOpions = {
            minDate: new Date(),
            maxDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            startingDay: 1,
            dateDisabled: function (date, mode) {
                return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
            }
        };

        var roomsPromise = httpServicesData.getRooms();
        var timeSlotsPromise = httpServicesData.getTimeslots();

        $q.all([roomsPromise, timeSlotsPromise]).then(function (response) {
            self.roomsObj = response[0].data;
            self.timeSlots = response[1].data;
        }, successfulLogOut);
    }

    self.timeSlots = [];
    self.roomsObj = [];
    self.reservationData = {}; // Current bookings from front end
    self.bookedMeetings = {}; // Already booked rooms of selected date
    self.selectedDates = []; //multiple date selector
    // self.selectedDate = new Date(); // Date Object from Calander
    self.formattedDate = null;
    self.getRoomAvailability = getRoomAvailability;
    self.bookSlot = bookSlot;
    self.clearSelection = clearSelection;
    self.doReservation = doReservation;
    self.deleteRoomReservation = deleteRoomReservation;
    
    function checkUserSession() {
        httpServicesData.getSession().then(init, function () { 
            $state.go('login');
        });
    }

    checkUserSession();
    
}