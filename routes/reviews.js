const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");

const { reviewSchema } = require("../schemas");
const { isLoggedIn, isReviewAuthor } = require("../middleware");

const reviewController = require("../controllers/reviews");

// Middleware to validate a review (could push this into middleware.js file later down the road)
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((element) => element.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// allow a user to post a review
router.post("/", isLoggedIn, validateReview, catchAsync(reviewController.submitReview));

// allow user to delete a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;
