const express = require("express");
const router = express.Router();
const passport = require("passport");
const tryCatchForAsync = require("../utils/tryCatchForAsync");
const User = require("../models/user");

router.get("/register", (req, res) => {
  res.render("users/register.ejs");
});

router.post(
  "/register",
  tryCatchForAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      //Another static method built-in passport, arguments:user, password
      //This will hash the password automatically
      const registeredUser = await User.register(user, password);
      //after the user registers we automatically want the user to be logged in so, req.login
      //.login is automatically added by passport
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

//Another middleware provided by passport called authenticate is used here
//It is working like magic, it takes the username and password from login.ejs form and checks itself, hahaha
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome back!");

    //We want the user to be directed to the path where the user left off after logging in
    //Also refer to middleware.js and app.js
    const redirectUrl = req.session.returnTo || "/campgrounds";
    //delete the path after being redirected
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  //passport automatically adds logout method to req, we just need to call it
  req.logout();
  req.flash("success", "Goodbye!");
  res.redirect("/campgrounds");
});

module.exports = router;
