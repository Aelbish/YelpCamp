const express = require("express");

//Express routes separates params i.e. params (id here) of the app.use("/prefix")  and router.post() are separated which we do not want
const router = express.Router({ mergeParams: true });

//Importing the Joi validating schema for server-side validation
const { reviewSchema } = require("../schemas");

const Campground = require("../models/campground");
const Review = require("../models/review");

const ExpressError = require("../utils/ExpressError");
const tryCatchForAsync = require("../utils/tryCatchForAsync");

//Selective middleware function to validate data in the server side
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Route to add a review to a campground
//validateReview is the middleware function for server-side validation of review object
router.post(
  "/",
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
    req.flash("success", "Successfully added a review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//Route to delete a review
//We want to remove the link to the review for each campground and the review itself so we have campgroundId and reviewId
router.delete(
  "/:reviewId",
  tryCatchForAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //The pull operator removes from an existing array any value that matches the Id
    //Here from the reviews array of Campground object we are removing any review that matches the reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //This will delete the actual review in the review collection
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
