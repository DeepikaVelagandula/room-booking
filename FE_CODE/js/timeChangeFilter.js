angular.module('timeChangeFilter', [])
    .filter('timeFormatter', function () {
        return function (timeslot) {
            if (timeslot) {
                var split = ((timeslot).toString()).split('.');
                if (split.length > 1) {
                    timeslot = split[0] + ':30';
                }
                else {
                    timeslot = split[0] + ':00';
                }

            }
            return timeslot;
        }
    });