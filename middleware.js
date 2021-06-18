//Importing the Joi validating schema for server-side validation
const { campgroundSchema, reviewSchema } = require("./schemas");

const ExpressError = require("./utils/ExpressError");

const Campground = require("./models/campground");
const Review = require("./models/review");

//Selective middleware function to validate data in the server side
module.exports.validateCampground = (req, res, next) => {
  //Check if the user submitted correct Schema or not
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Selective middleware function to validate data in the server side
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  //isAuthenticated is added to req automatically by passport which can be used to identify if a user is logged in
  //Works like magic
  if (!req.isAuthenticated()) {
    //When we check if the user is logged in we want the user to be directed to the page where the user wanted to go after logging in
    req.session.returnTo = req.originalUrl;

    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  //Only give permission to edit if the logged in user is the author of the camp wrt id
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  //Only give permission to edit if the logged in user is the author of the camp wrt id
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
