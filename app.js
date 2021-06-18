//Main file
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

//Route objects
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

//Connect to the mongoDB database
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
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
//To use the public folder to serve static files such as images, CSS files, and JS files
app.use(express.static(path.join(__dirname, "public")));
//To create sessions and use flash
const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
//To use flash
app.use(flash());

//middlewares for passport, app.use(session) should come before app.use(passport.session())
app.use(passport.initialize());
app.use(passport.session());
//The authenticate method is added in the static methods for User because of passport
passport.use(new LocalStrategy(User.authenticate()));
//Store in session
passport.serializeUser(User.serializeUser());
//Remove from session
passport.deserializeUser(User.deserializeUser());

//Middleware that will pass the req.flash object for each route if there is one
//Instead of passing req.flash while rendering or redirecting to a .ejs we have defined a middleware
app.use((req, res, next) => {
  //passport also stores user in req, we manually add this to local.currentUser
  res.locals.currentUser = req.user;
  //So sucess and error will be locally available to all ejs files
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//ROUTES
//Use campground route object and prefix it with /campgrounds
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

//Route for homepage
app.get("/", (req, res) => {
  res.render("home.ejs");
});

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

//We used this initally to make our first object in the database, then we used seedHelpers.js
// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   await camp.save();
//   res.send(camp);
// });
