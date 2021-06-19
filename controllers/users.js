const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register.ejs");
};

module.exports.register = async (req, res) => {
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
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back!");

  //We want the user to be directed to the path where the user left off after logging in
  //Also refer to middleware.js and app.js
  const redirectUrl = req.session.returnTo || "/campgrounds";
  //delete the path after being redirected
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  //passport automatically adds logout method to req, we just need to call it
  req.logout();
  req.flash("success", "Goodbye!");
  res.redirect("/campgrounds");
};
