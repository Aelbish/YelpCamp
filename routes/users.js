const express = require("express");
const router = express.Router();
const passport = require("passport");
const tryCatchForAsync = require("../utils/tryCatchForAsync");
const User = require("../models/user");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegister)
  .post(tryCatchForAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  //Another middleware provided by passport called authenticate is used here
//It is working like magic, it takes the username and password from login.ejs form and checks itself, hahaha
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
