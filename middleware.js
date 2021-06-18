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
