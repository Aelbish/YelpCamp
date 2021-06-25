//Main file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
//To connect session to our MongoDB cloud
const mongoDBStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
//Package that prevents MongoInjection
const mongoSanitize = require("express-mongo-sanitize");

const helmet = require("helmet");

//Route objects
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
//Local: "mongodb://localhost:27017/yelp-camp"
//Connect to the mongoDB database
mongoose.connect(dbUrl, {
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

app.use(mongoSanitize());

const secret = process.env.SECRET || "thisshouldbeabettersecret";

//To create sessions and use flash
const sessionConfig = {
  //our custom name for the cookie
  name: "xor",
  secret,
  resave: false,
  saveUninitialized: true,
  //store the session in our MongoDB cloud
  //this will create a new collection called sessions just like users/reviews/campgrounds automatically
  //before the sessions were stored in the browser memoryStore, but now it is stored in our database
  store: mongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
  }),
  cookie: {
    httpOnly: true,
    //https
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

sessionConfig.store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

app.use(session(sessionConfig));
//To use flash
app.use(flash());

app.use(helmet());

//Helmet configurations for CSP(Content-Security-Policy)
const scriptSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dhny1nvul/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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

const port = process.env.PORT || 3000;

//Start local server at port 3000
app.listen(port, () => {
  console.log(`Listening in port ${port}`);
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
