//This is the file that creates the model

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: {
    type: String,
  },
  price: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
});

module.exports = mongoose.model("Campground", CampgroundSchema);
