const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

const userController = require("../controllers/user");

// use router.route to refactor the /register routes with different http verbs
router.route("/register").get(userController.getRegistrationForm).post(catchAsync(userController.registerUser));

// router.get("/register", userController.getRegistrationForm);

// router.post("/register", catchAsync(userController.registerUser));

// user route.route to refactor the /log routes with different http verbs
router
  .route("/login")
  .get(userController.getLoginForm)
  .post(storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), userController.confirmLogin);

// router.get("/login", userController.getLoginForm);

// use the storeReturnTo middleware to save the returnTo value from session to res.locals
// passport.authenticate logs the user in and clears req.session
// router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), userController.confirmLogin);

router.get("/logout", userController.logoutUser);

module.exports = router;
