// adminAuth.js

const express = require("express");
const { login, isAuthenticated } = require("../Controllers/adminAuth");
const { getAllTrips, getAllUsers } = require("../Controllers/adminController");

const router = express.Router();

// Admin login route
router.post("/admin/login", login);

router.get("/admin/trips", isAuthenticated, getAllTrips);
router.get("/admin/users", isAuthenticated, getAllUsers);

module.exports = router;
