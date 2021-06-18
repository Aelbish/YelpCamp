const express = require("express");
//Here we do not need mergeParams option becuase all the param (id) is here only, not in app.js
//But this is not the case in reviews.js routes
const router = express.Router();

//Importing the Joi validating schema for server-side validation
const { campgroundSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");

const Campground = require("../models/campground");

const ExpressError = require("../utils/ExpressError");
const tryCatchForAsync = require("../utils/tryCatchForAsync");

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

//Route for list of campgrounds
router.get(
  "/",
  tryCatchForAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  })
);

//Route to create a new campground, this should be fore /campgrounds/:id or else /new will be identified as an id
//isLoggedIn is a middleware defined in middleware.js with the the help of passport
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
});

//Route to add a new campground to Mongo
//validateCampground is a middleware function
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  tryCatchForAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Route to show details of a campground
router.get(
  "/:id",
  tryCatchForAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", { campground });
  })
);

//Route to render edit page for a campground
router.get(
  "/:id/edit",
  isLoggedIn,
  tryCatchForAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit.ejs", { campground });
  })
);

//Route to update a campground
//validateCampground is a middleware function
router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  tryCatchForAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated the campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Route to delete a campground
//Note the Campground.findByIdAndDelete(id) will trigger the middleware findOneAndDelete defined in the campground.js file
//So if we delete a campground all the reviews associated with that campground will be deleted
//Refer to mongoose doc for this
router.delete(
  "/:id",
  isLoggedIn,
  tryCatchForAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
