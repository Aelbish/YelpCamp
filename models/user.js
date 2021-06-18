const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
});

//we did npm i passport passport-local passport-local-mongoose
//This will add the user and password atrribute automatically to our schema
//Hence we did  not define the password and username in our Schema above
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
