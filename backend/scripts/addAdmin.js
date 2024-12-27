const mongoose = require("mongoose");
const Admin = require("../Models/admin");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

// Connect to the database
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

// Create an admin user
const createAdmin = async () => {
  const username = "ujjval";
  const email = "iam@ujjvalbihola.com";
  const password = "Ujjval@41212";

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new Admin({
    username,
    email,
    password: hashedPassword,
  });

  newAdmin
    .save()
    .then(() => {
      console.log("Admin user created successfully");
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error("Error creating admin user:", err);
      mongoose.connection.close();
    });
};

createAdmin();
