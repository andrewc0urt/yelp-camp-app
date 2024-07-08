const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body.user;
      //   console.log(req.body.user);
      //   console.log(username, email, password);
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);

      // log the user in
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to YelpCamp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

// use the storeReturnTo middleware to save the returnTo value from session to res.locals
// passport.authenticate logs the user in and clears req.session
router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), async (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  // Now use res.locals.returnTo to redirect the user after login
  const redirectUrl = res.locals.returnTo || "/campgrounds";

  res.redirect(redirectUrl);
});

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You've successfully logged out!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
