const { campgroundSchema } = require("./schemas");
const ExpressError = require("./utilities/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

const isLoggedIn = (req, res, next) => {
  // console.log(req.path, "------------", req.originalUrl);
  // use Passport's isAuthenticated to see if a user's logged in
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in to access this page.");
    return res.redirect("/login");
  }
  // otherwise, you're good to go, call next
  next();
};

// // This also works, just a different way of exporting. Must use const { isLogged In } when importing
// module.exports.isLoggedIn = (req, res, next) => {
//   // use Passport's isAuthenticated to see if a user's logged in
//   if (!req.isAuthenticated()) {
//     req.flash("error", "You must be signed in to access this page.");
//     return res.redirect("/login");
//   }
//   // otherwise, you're good to go, call next
//   next();
// };

// Middleware function to transfer the returnTo value from the session (req.session.returnTo) to the
// Express.js app res.locals objects before the passport.authenticate() is excuted in the /login route
// ultimately clearing the session after successful login
const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

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

// Middleware to Check if Campground Author Id matches the Currently Logged In User Id
const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  // Protect the campground so it cannot be edited on backend if the author doesn't match the current logged in user
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};

// Middleware to Check if Review Autho matches the Currently Logged in User
const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user.id)) {
    req.flash("error", "You do not have permission Edit or Delete reviews. ");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};

module.exports = { isLoggedIn, storeReturnTo, validateCampground, isAuthor, isReviewAuthor };
