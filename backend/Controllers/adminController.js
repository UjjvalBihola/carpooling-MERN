const Trip = require("../Models/tripModel"); // Assuming Trip model is defined
const User = require("../Models/user"); // Assuming User model is defined

exports.getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find();
        res.json(trips);
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};
