const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { campgroundSchema, reviewSchema } = require("../schemas");
// const { isLoggedIn } = require("../middleware");
const { isLoggedIn } = require("../middleware");

// Middleware to Validate a new campground using JOI
const validateCampground = (req, res, next) => {
  // use the JOI .validate method to get any errors
  // take the 'error' key from the resulting object after .validate(req.body)
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // use map to iterate over each object in the 'details' array and extract the error message
    const msg = error.details.map((element) => element.message).join(",");
    // console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render(`campgrounds/index`, { allCampgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/newCampground");
});

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground) {
    // 	throw new ExpressError("Invalid Campground Data", 400);
    // }

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully created a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Uh-oh, that campground was not found!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/editCampground", { campground });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      {
        runValidators: true,
        new: true,
      }
    );

    console.log(updatedCampground);
    req.flash("success", "Campground has been updated!");
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleteCampground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");

    if (!campground) {
      req.flash("error", "Uh-oh, that campground was not found!");
      return res.redirect("/campgrounds");
    }
    // console.log(campground);
    res.render("campgrounds/showDetails", { campground });
  })
);

// export the router to be used in router.js
module.exports = router;
