/* temporary route to get all the user information*/
const express = require("express");
const { allusersRoutes } = require("../Controllers/allusersRoutes.js");
var router = express.Router();

router.get("/users", allusersRoutes);
module.exports = router;
