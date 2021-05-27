//Main file
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

//Connect to the mongoDB database
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

//Handle connection error to mongoDB database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connection to database successful");
});

const app = express();

//Enable ejs and paths for the ejs files in the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Route for homepage
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/makecampground", async (req, res) => {
  const camp = new Campground({
    title: "My Backyard",
    description: "cheap camping",
  });
  await camp.save();
  res.send(camp);
});

//Start local server at port 3000
app.listen(3000, () => {
  console.log("Listening in port 3000");
});
