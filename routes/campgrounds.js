const express = require("express");
//Here we do not need mergeParams option becuase all the param (id) is here only, not in app.js
//But this is not the case in reviews.js routes
const router = express.Router();
//Controllers
const campgrounds = require("../controllers/campgrounds");

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const Campground = require("../models/campground");

const tryCatchForAsync = require("../utils/tryCatchForAsync");

router
  .route("/")
  //Route for list of campgrounds
  .get(tryCatchForAsync(campgrounds.index))
  //Route to add a new campground to Mongo
  //validateCampground is a middleware function
  .post(
    isLoggedIn,
    validateCampground,
    tryCatchForAsync(campgrounds.createCampground)
  );

//Route to create a new campground, this should be fore /campgrounds/:id or else /new will be identified as an id
//isLoggedIn is a middleware defined in middleware.js with the the help of passport
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  //Route to show details of a campground
  .get(tryCatchForAsync(campgrounds.showCampground))
  //Route to update a campground
  //validateCampground is a middleware function
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    tryCatchForAsync(campgrounds.updateCampground)
  )
  //Route to delete a campground
  //Note the Campground.findByIdAndDelete(id) will trigger the middleware findOneAndDelete defined in the campground.js file
  //So if we delete a campground all the reviews associated with that campground will be deleted
  //Refer to mongoose doc for this
  .delete(isLoggedIn, isAuthor, tryCatchForAsync(campgrounds.deleteCampground));

//Route to render edit page for a campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  tryCatchForAsync(campgrounds.renderEditForm)
);

module.exports = router;
