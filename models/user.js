const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// add on username and password fields to Schema - Passport does this behind the scenes
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
