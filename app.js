//Main file
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

//Importing the Joi validating schema for server-side validation
const { campgroundSchema, reviewSchema } = require("./schemas");

const methodOverride = require("method-override");
const tryCatchForAsync = require("./utils/tryCatchForAsync");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

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

//To make boilerplates for our pages
app.engine("ejs", ejsMate);

//Enable ejs and paths for the ejs files in the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//To parse req.body from the POST method
app.use(express.urlencoded({ extended: true }));

//To use PUT method in the form by overriding POST method
app.use(methodOverride("_method"));

//Selective middleware function to validate data in the server side
const validateCampground = (req, res, next) => {
  //Check if the user submitted correct Schema or not
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

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
app.get(
  "/campgrounds",
  tryCatchForAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  })
);

//Route to create a new campground, this should be fore /campgrounds/:id or else /new will be identified as an id
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});

//Route to add a new campground to Mongo
//validateCampground is a middleware function
app.post(
  "/campgrounds",
  validateCampground,
  tryCatchForAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Route to show details of a campground
app.get(
  "/campgrounds/:id",
  tryCatchForAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show.ejs", { campground });
  })
);

//Route to render edit page for a campground
app.get(
  "/campgrounds/:id/edit",
  tryCatchForAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit.ejs", { campground });
  })
);

//Route to update a campground
//validateCampground is a middleware function
app.put(
  "/campgrounds/:id",
  validateCampground,
  tryCatchForAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Route to delete a campground
//Note the Campground.findByIdAndDelete(id) will trigger the middleware findOneAndDelete defined in the campground.js file
//So if we delete a campground all the reviews associated with that campground will be deleted
//Refer to mongoose doc for this
app.delete(
  "/campgrounds/:id",
  tryCatchForAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

//Route to add a review to a campground
//validateReview is the middleware function for server-side validation of review object
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  tryCatchForAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    //If you look at show.ejs we have defined name as review[body] so review object will be sent from the form which is parsed here
    const review = new Review(req.body.review);
    //Add the captured review into the campground, now campground and reviews are connected
    //The campground.reviews will have the objectId of the review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Route to delete a review
//We want to remove the link to the review for each campground and the review itself so we have campgroundId and reviewId
app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  tryCatchForAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //The pull operator removes from an existing array any value that matches the Id
    //Here from the reviews array of Campground object we are removing any review that matches the reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //This will delete the actual review in the review collection
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

//Note the order of this code matters
//If none of the above routes are called then this will be executed
app.all("*", (req, res, next) => {
  //This error will be passed to the error handler below i.e. err will be ExpressError
  next(new ExpressError("Page Not Found", 404));
});

//Our error handler which will be used when next(err) is executed
//This will catch any error
app.use((err, req, res, next) => {
  //Here the default value for the statusCode will be 500
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  //Handle the error by setting the status code and rendering the error template
  res.status(statusCode).render("error.ejs", { err });
});

//Start local server at port 3000
app.listen(3000, () => {
  console.log("Listening in port 3000");
});
