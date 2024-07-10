const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
// const { isLoggedIn } = require("../middleware");
const { validateCampground, isLoggedIn, isAuthor } = require("../middleware");

// import the route logic (functions) from controllers
const campgroundController = require("../controllers/campgrounds");

router.get("/", catchAsync(campgroundController.index));

router.get("/new", isLoggedIn, campgroundController.getNewCampgroundForm);

router.post("/", isLoggedIn, validateCampground, catchAsync(campgroundController.createNewCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgroundController.getEditCampgroundForm));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

router.get("/:id", catchAsync(campgroundController.showCampground));

// export the router to be used in router.js
module.exports = router;
