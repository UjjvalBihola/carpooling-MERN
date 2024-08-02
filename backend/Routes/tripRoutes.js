const express = require("express");
const { isSignedin } = require("../Controllers/authenticate");
const { 
    drive, 
    ride, 
    cancelTrip, 
    tripDone, 
    tripHistory, 
    activeTrip, 
    isDriver,
    requestRide,
    respondToRequest,
    submitFeedback
} = require("../Controllers/trip.js");

var router = express.Router();

// Route for drivers to create a trip
router.post("/trip/drive", isSignedin, drive);  // Swagger Api done

// Route for riders to join a trip
router.post("/trip/ride", isSignedin, ride);    //Swagger Api done

// Route to cancel a trip
router.delete("/trip", isSignedin, cancelTrip); // Swagger Api pending

// Route to mark a trip as completed
router.post("/trip/done", isSignedin, tripDone); // Swagger Api pending

// Route to retrieve the history of trips
router.get("/trip/history", isSignedin, tripHistory); // Swagger Api pending

// Route to check if the user is a driver in any active trip
router.get("/trip/isdriver", isSignedin, isDriver);

// Route to check if there is an active trip for the user
router.get("/trip/activetrip", isSignedin, activeTrip);

// Route for riders to request a ride
router.post("/trip/:tripId/request", isSignedin, requestRide);

// Route for drivers to respond to ride requests
router.patch("/trip/:tripId/respond", isSignedin, respondToRequest);

// Route for users to submit feedback after a trip
router.post("/trip/:tripId/feedback", isSignedin, submitFeedback);

module.exports = router;
