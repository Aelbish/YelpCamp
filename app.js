//Main file
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
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

//To parse req.body from the POST method
app.use(express.urlencoded({ extended: true }));

//To use PUT method in the form by overriding POST method
app.use(methodOverride("_method"));

//Route for homepage
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//We used this initally to make our first object in the database, then we used seedHelpers.js
// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   await camp.save();
//   res.send(camp);
// });

//Route for list of campgrounds
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index.ejs", { campgrounds });
});

//Route to create a new campground, this should be fore /campgrounds/:id or else /new will be identified as an id
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

//Route to show details of a campground
app.get("/campgrounds/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show.ejs", { campground });
});

//Route to render edit page for a campground
app.get("/campgrounds/:id/edit", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit.ejs", { campground });
});

//Route to update a campground
app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});

//Route to delete a campground
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

//Start local server at port 3000
app.listen(3000, () => {
  console.log("Listening in port 3000");
});
