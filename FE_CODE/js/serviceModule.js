angular.module("serviceModule",[])
    .service("httpServicesData", httpServicesData);

function httpServicesData($http) {
    function loginDetils(userName, password) {
        return $http({
            url: 'http://localhost:3001/signin',
            method: "POST",
            data: {
                'userName': userName,
                'password': password
            }
        })
    }
    function getSession() {
        return $http.get('http://localhost:3001/session', { withCredentials: false })
    }

    function deleteSession() {
        return $http.delete('http://localhost:3001/session', { withCredentials: false })
    }

    function roomsService() {
        return $http.get('http://localhost:3001/rooms')
    }
    
    function timeslotsService() {
        return $http.get('http://localhost:3001/timeslots')
    }
    
    function roomBookingDetailsService(date) {
        return $http.get('http://localhost:3001/bookings/'+date)
    }
    
    function requestingRoomBookingService(date,bookingObj){
        return $http({
            url: 'http://localhost:3001/bookings/'+date,
            method: "POST",
            data: bookingObj
        })
    }

    function deleteBookingRoomSlot(date, room, slot){
        return $http({
            url:'http://localhost:3001/bookings/'+date+'/'+room+'/'+slot,
            method:'DELETE'
        })
    }

    this.getRooms = roomsService;
    this.getTimeslots = timeslotsService;
    this.roomBookingDetailsService = roomBookingDetailsService;
    this.requestingRoomBookingService = requestingRoomBookingService;
    this.deleteBookingRoomSlot = deleteBookingRoomSlot;
    this.deleteSession = deleteSession;
    this.getSession = getSession;
    this.loginDetils = loginDetils;
}