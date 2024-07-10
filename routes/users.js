const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

const userController = require("../controllers/user");

router.get("/register", userController.getRegistrationForm);

router.post("/register", catchAsync(userController.registerUser));

router.get("/login", userController.getLoginForm);

// use the storeReturnTo middleware to save the returnTo value from session to res.locals
// passport.authenticate logs the user in and clears req.session
router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), userController.confirmLogin);

router.get("/logout", userController.logoutUser);

module.exports = router;
