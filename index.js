const express = require('express');
const bodyParser = require('body-parser');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// TimeSlots DB
const timeSlotsAdapter = new FileSync('./db/timeslots.json');
const timeSlotsDB = low(timeSlotsAdapter);

// Rooms DB
const roomsAdpter = new FileSync('./db/rooms.json');
const roomsDB = low(roomsAdpter);

// Bookings DB

const bookingsAdapter = new FileSync('./db/bookings.json');
const bookingsDB = low(bookingsAdapter);

bookingsDB.defaults({ bookings: {} }).write();

timeSlotsDB.defaults({ slots: [] })
    .write();

const app = express();
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// returns available rooms.
app.get('/rooms', (req, res) => {
    res.send(roomsDB.getState());
});

//returns time slots
app.get('/timeslots', (req, res) => {
    res.send(timeSlotsDB.getState());
});

//returns Bookings of given date
// date should be DD-mm-YYYY Ex: 01-12-2018 (01 December 2018)
app.get('/bookings/:date', (req, res) => {
    let date = req.params.date;
    let bookings = bookingsDB.get('bookings').value();
    if (bookings[date]){
        res.send(bookings[date]);
    }else{
        res.status(201);
    }
});

/* bookings: {
    roomId: {
        slotId: {
            bookingId: 1234,
            meetingName: Refinement,
            Contact: Deepika,
            Team: RIB,
            phone: 9515114032
        }
    }
} */

app.post('/bookings/:date', doReservation);

function doReservation(req, res){
    let bookingDate = req.params.date;
    let bookingData = req.body;
    let _dateBookings = {};
    let isConflictsPresent = false;
    if(bookingData){
        if(bookingsDB.has(`bookings.${bookingDate}`).value()){
            _dateBookings = bookingsDB.get(`bookings.${bookingDate}`).value();
        }
        Object.keys(bookingData).forEach((room) => {
            _dateBookings[room] = _dateBookings[room] || {};
            Object.keys(bookingData[room]).forEach((slot) => {
                if(!_dateBookings[room][slot]){
                    _dateBookings[room][slot] = bookingData[room][slot];
                }else{
                    isConflictsPresent = true;
                }
            });
        });
        if(!isConflictsPresent){
            bookingsDB.set(`bookings.${bookingDate}`, _dateBookings).write();
            res.send(_dateBookings);
        }else{
            res.status(400).send({
                message: 'Code_room_booking_conflict'
            });
        }
    }else{
        res.status(400).send({
            message: 'Code_room_booking_data_required'
        });
    }
}

function createTimeSlots() {

    let startTime = 8.5;
    let endTime = 19; // 7PM using 24-hour format
    let slots = [];
    // Creating a slot for every 30 mins
    for (let slotTime = startTime; slotTime <= endTime; slotTime = slotTime + 0.5) {
        let slot = {};
        slot.id = 'slot_' + slotTime;
        slot.time = slotTime;
        slots.push(slot);
    }

    timeSlotsDB.set('slots', slots).write();
}

createTimeSlots();

app.listen(3001, () => {
    console.log("listening...");
});
