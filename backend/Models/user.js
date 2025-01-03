const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");
const schema = mongoose.Schema;

const userSchema = new schema(
  {
    name: {
      type: String,
      require: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    phone_number: {
      type: Number,
      trim: true,
    },
    encry_password: {
      type: String,
      require: true,
    },
    salt: String, // will store the encryption of password field
    user_photo: {
      data: Buffer,
      ContentType: String,
    },
    trips: {
      type: Array,
      default: [],
    },
    active_trip: {
      type: mongoose.ObjectId,
    },
    trip_role_driver: {
      type: Boolean,
    },
  },
  { timestamps: true }
);
userSchema.virtual("password").set(function (password) {
  (this._password = password), (this.salt = uuidv1());
  this.encry_password = this.securePassword(password);
});

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },
  securePassword: function (plainpassword) {
    return crypto
      .createHmac("sha256", this.salt)
      .update(plainpassword)
      .digest("hex");
  },
};
module.exports = mongoose.model("user", userSchema);
