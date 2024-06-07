const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const Campground = require("./models/campground");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const campgroundsRoute = require('./routes/campgrounds')

// use ejs-locals for all ejs templates:
app.engine("ejs", ejsMate);

// Set EJS as the templating engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Body-parsing middleware to pupulate the req.body
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// npm package method-override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Connect mongoose
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp-app", {});
  console.log("Database is successfully connected.");
}

// Middleware to Validate a new campground using JOI
// const validateCampground = (req, res, next) => {
//   // use the JOI .validate method to get any errors
//   // take the 'error' key from the resulting object after .validate(req.body)
//   const { error } = campgroundSchema.validate(req.body);
//   if (error) {
//     // use map to iterate over each object in the 'details' array and extract the error message
//     const msg = error.details.map((element) => element.message).join(",");
//     // console.log(msg);
//     throw new ExpressError(msg, 400);
//   } else {
//     next();
//   }
// };

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((element) => element.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

app.use('/campgrounds', campgroundsRoute)

// ROUTES
app.get("/", (req, res) => {
  res.render("home");
});

// allow user to delete a review
app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    // find the campground and delete the corresponding id
    // find the review using the id
    const { id, reviewId } = req.params;

    // using the specific campground to delete the specified review associated with it in the db
    const removeCampgroundReview = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // delete the review from the reviews db collection
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    // console.log(`This is the deleted review: ${deletedReview}`);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const campground = await Campground.findById(id);

    const review = new Review(req.body.review);

    campground.reviews.push(review);

    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Catch all for routes that don't match above routes
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
// Express error-handling middleware
app.use((err, req, res, next) => {
  // const { message = "Something went wrong!", statusCode = 500 } = err;
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Ooops! Something went wrong.";
  }
  res.status(statusCode).render("error", { err });
});

// Start the Express server and listen for incoming requests on the specified port
// Log a message to the console indicating the server is running and the port number
app.listen(port, () => {
  console.log(`YelpCamp app listening on port ${port}`);
});
