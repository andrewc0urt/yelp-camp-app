const Review = require("../models/review");
const Campground = require("../models/campground");

// logic to post a review after review submit it via the form
const submitReview = async (req, res) => {
  // console.log(req.params);
  const { id } = req.params;
  const campground = await Campground.findById(id);

  const review = new Review(req.body.review);

  // set the author of the review
  review.author = req.user._id;
  // console.log(review);

  // console.log(`Campground: ${campground}`);

  campground.reviews.push(review);
  //   console.log("REVIEW:", review);

  await review.save();
  await campground.save();
  req.flash("success", "Your review has been submitted!");

  res.redirect(`/campgrounds/${campground._id}`);
};

// logic to delete a review
const deleteReview = async (req, res) => {
  // find the campground and delete the corresponding id
  // find the review using the id
  const { id, reviewId } = req.params;

  // using the specific campground to delete the specified review associated with it in the db
  const removeCampgroundReview = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // delete the review from the reviews db collection
  const deletedReview = await Review.findByIdAndDelete(reviewId);
  // console.log(`This is the deleted review: ${deletedReview}`);

  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports = { submitReview, deleteReview };
