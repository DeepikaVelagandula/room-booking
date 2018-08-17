const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

//user login
const userDetaisAdapter = new FileSync('./db/users.json');
const userDetailsDB = low(userDetaisAdapter);

// TimeSlots DB
const timeSlotsAdapter = new FileSync('./db/timeslots.json');
const timeSlotsDB = low(timeSlotsAdapter);

// Rooms DB
const roomsAdpter = new FileSync('./db/rooms.json');
const roomsDB = low(roomsAdpter);

// Bookings DB

const bookingsAdapter = new FileSync('./db/bookings.json');
const bookingsDB = low(bookingsAdapter);


// Setting Defaults

bookingsDB.defaults({ bookings: {} }).write();

timeSlotsDB.defaults({ slots: [] }).write();

userDetailsDB.defaults({ users: [] }).write();

roomsDB.defaults({ rooms: [] }).write();

const app = express();
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use('/', express.static('FE_CODE'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 60 * 1000 }
}));

app.post('/signin', function(req, res){
    let userToken = null;
    let users = userDetailsDB.get('users').value();
    
    if(req.body && req.body.userName && req.body.password){
        for(let user of users){
            if(user.name == req.body.userName && user.password == req.body.password){
                userToken = user.id
                loggedInUser = user
            }
        }
        if(userToken){
            req.session.userId = userToken;
            res.send({
                id: userToken,
                name: loggedInUser.name,
                admin: loggedInUser.admin

            });
        }else{
            res.status(404).send({
                error: 'not  a valid user'
            });
        }
    }else{
        res.status(400).send({
            error: 'Bad request'
        });
    }
});

app.get('/session', function(req, res){
    let sessionUserId = req.session.userId;
    let loggedInUser = null;
    if (sessionUserId){
        let users = userDetailsDB.get('users').value();
        for (let user of users) {
            if (user.id === sessionUserId) {
                loggedInUser = user
            }
        }
        res.send({
            name: loggedInUser.name,
            admin: loggedInUser.admin
        });
     }else{
        res.status(400).send({
            error: 'Bad request'
        });
     }
 });

 app.delete('/session', function(req, res){
    req.session.userId = null;
    req.session.destroy();
    res.sendStatus(201);
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
    if (bookings[date]) {
        res.send(bookings[date]);
    } else {
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

app.delete('/bookings/:date/:room/:slot', deleteBookedReservation);

function deleteBookedReservation(req, res) {
    let deleteDate = req.params.date;
    let deleteRoom = req.params.room;
    let deleteSlot = req.params.slot;
    //let bookingData = req.body
    if (deleteDate && deleteRoom && deleteSlot) {
        if (bookingsDB.has(`bookings.${deleteDate}`).value()) {
            _dateBookings = bookingsDB.get(`bookings.${deleteDate}`).value();
        }
        if (_dateBookings && _dateBookings[deleteRoom] && _dateBookings[deleteRoom][deleteSlot]) {
            delete _dateBookings[deleteRoom][deleteSlot]
            bookingsDB.set(`bookings.${deleteDate}`, _dateBookings).write();
            res.send(_dateBookings);
        } else {
            res.status(400).send({
                message: 'Unbale to delete'
            });
        }
    } else {
        res.status(400).send({
            message: 'Delete unsuccessful. Please check your data.'
        });
    }
}

/*---Delete Multiple slots
app.post('/bookings/:date', deleteMultipleSlots);

function deleteMultipleSlots(req, res) {
    let deleteMultipleSlotDate = req.params.date;
    let deleteMultipleSlotData = req.body;
    if (deleteMultipleSlotData) {
        if (bookingsDB.has(`bookings.${deleteMultipleSlotDate}`).value()) {
            _dateBookings = bookingsDB.get(`bookings.${deleteMultipleSlotDate}`).value();
        }
        Object.keys(deleteMultipleSlotData).forEach((room) => {
            Object.keys(deleteMultipleSlotData[room]).forEach((slot) => {
                if (_dateBookings[room][slot]) {
                    delete _dateBookings[room][slot];
                }
            });
        });
        bookingsDB.set(`bookings.${bookingDate}`, _dateBookings).write();
        res.send(_dateBookings);   
    } else {
        res.status(400).send({
            message: 'Code_room_deleting_data_required'
        });
    }
}
...*/

app.post('/bookings/multidate', doReservation);

function doReservation(req, res) {
    let bookingDates = req.body.dates;
    let bookingData = req.body.bookingObj;
    let _dateBookings = {};
    let isConflictsPresent = false;
    if (bookingData) {
        for(i=0;i<bookingDates.length;i++){
            if (bookingsDB.has(`bookings.${bookingDates[i]}`).value()) {
                _dateBookings = bookingsDB.get(`bookings.${bookingDates[i]}`).value();
            }
        }
        Object.keys(bookingData).forEach((room) => {
            _dateBookings[room] = _dateBookings[room] || {};
            Object.keys(bookingData[room]).forEach((slot) => {
                if (!_dateBookings[room][slot]) {
                    _dateBookings[room][slot] = bookingData[room][slot];
                } else {
                    isConflictsPresent = true;
                }
            });
        });
        if (!isConflictsPresent) {
            for(i=0;i<bookingDates.length;i++){
                bookingsDB.set(`bookings.${bookingDates[i]}`, _dateBookings).write();
            }
            res.send(_dateBookings);
            
        } else {
            res.status(400).send({
                message: 'Code_room_booking_conflict'
            });
        }
    } else {
        res.status(400).send({
            message: 'Code_room_booking_data_required'
        });
    }
}

function createTimeSlots() {
    let startTime = 0.5;
    let endTime = 24.0; // 7PM using 24-hour format
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
    console.log("listening... on 3001");
});
