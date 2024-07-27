// adminAuth.js

const Admin = require("../Models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the admin user exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create and send a token
        const token = jwt.sign({ id: admin._id }, process.env.SECRET, {
            expiresIn: "1h",
        });

        res.json({ token, adminId: admin._id, username: admin.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.adminId = decoded.id;
        next();
    });
};
