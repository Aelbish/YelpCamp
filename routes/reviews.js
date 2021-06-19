const express = require("express");

//Express routes separates params i.e. params (id here) of the app.use("/prefix")  and router.post() are separated which we do not want
const router = express.Router({ mergeParams: true });

const Campground = require("../models/campground");
const Review = require("../models/review");

const reviews = require("../controllers/reviews");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const tryCatchForAsync = require("../utils/tryCatchForAsync");

//Route to add a review to a campground
//validateReview is the middleware function for server-side validation of review object
router.post(
  "/",
  isLoggedIn,
  validateReview,
  tryCatchForAsync(reviews.createReview)
);

//Route to delete a review
//We want to remove the link to the review for each campground and the review itself so we have campgroundId and reviewId
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  tryCatchForAsync(reviews.deleteReview)
);

module.exports = router;
