const express = require('express');
const bodyParser = require('body-parser');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// TimeSlots DB
const timeSlotsAdapter = new FileSync('./db/timeslots.json');
const timeSlotsDB = low(timeSlotsAdapter);

// Rooms DB
const roomsAdpter = new FileSync('./db/rooms.json');
const roomsDB = low(roomsAdpter);

// Bookings DB

const bookingsAdapter = new FileSync('./db/bookings.json');
const bookingsDB = low(bookingsAdapter);

bookingsDB.defaults({bookings:{}}).write();

timeSlotsDB.defaults({ slots: [] })
.write();

const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// returns available rooms.
app.get('/rooms', (req, res)=>{
    res.send(roomsDB.getState());
});

//returns time slots
app.get('/timeslots', (req, res)=>{
    res.send(timeSlotsDB.getState());
});

function createTimeSlots(){

    let startTime = 8.5;
    let endTime = 19; // 7PM using 24-hour format
    let slots = [];
    // Creating a slot for every 30 mins
    for(let slotTime = startTime; slotTime <= endTime; slotTime = slotTime + 0.5){
        let slot = {};
        slot.id = 'slot_'+slotTime;
        slot.time = slotTime;
        slots.push(slot);
    }

    timeSlotsDB.set('slots', slots).write();
}

createTimeSlots();

app.listen(3001, () =>{
    console.log("listening...");
});
