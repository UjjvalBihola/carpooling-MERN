const user = require("../Models/user.js");
exports.allusersRoutes = (req, res) => {
  user.find().exec((err, ud) => {
    res.json(ud);
  });
};
