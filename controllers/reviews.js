//All the functions to render pages for reviews route
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  //If you look at show.ejs we have defined name as review[body] so review object will be sent from the form which is parsed here
  const review = new Review(req.body.review);
  review.author = req.user._id;
  //Add the captured review into the campground, now campground and reviews are connected
  //The campground.reviews will have the objectId of the review
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Successfully added a review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  //The pull operator removes from an existing array any value that matches the Id
  //Here from the reviews array of Campground object we are removing any review that matches the reviewId
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  //This will delete the actual review in the review collection
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted the review!");
  res.redirect(`/campgrounds/${id}`);
};
