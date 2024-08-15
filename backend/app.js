const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const authRoutes = require("./Routes/authentication");
const allusersRoutes = require("./Routes/allusersRoutes");
const adminAuthRoutes = require("./Routes/adminAuth");
const tripRoutes = require("./Routes/tripRoutes");

// MongoDb connection
var db = mongoose
  .connect(process.env.DATABASE_URI)
  .then(console.log("DB connected"));

//Middleware
app.use(bodyparser.json());
app.use(cookieparser());
app.use(cors());

//Routes
app.use("/api", adminAuthRoutes);

app.use("/api", authRoutes);
app.use("/api", allusersRoutes);
app.use("/api", tripRoutes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(process.env.PORT || 8000, () => {
  console.log(`Listening on a port`);
});

module.exports = app;
