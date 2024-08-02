if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

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
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");

const userRoute = require("./routes/users");
const campgroundsRoute = require("./routes/campgrounds");
const reviewsRoute = require("./routes/reviews");
const User = require("./models/user");

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

app.use(flash());

// tell express to serve up the public folder with static files
app.use(express.static(path.join(__dirname, "public")));

// middleware to use express-mongo-sanitize to prevent nosql injection attacks
app.use(mongoSanitize());

// use express-session
const sessionConfig = {
  secret: "thisisatemporarysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// middleware required to use passport (see docs for more)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // tell passport to use LocalStrategy, pass the User model and authenticate it

// maintain a login session for a user (store and unstore sessions)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connect mongoose
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp-app", {});
  console.log("Database is successfully connected.");
}

// const validateReview = (req, res, next) => {
//   const { error } = reviewSchema.validate(req.body);

//   if (error) {
//     const msg = error.details.map((element) => element.message).join(",");
//     throw new ExpressError(msg, 400);
//   } else {
//     next();
//   }
// };

// Middleware
app.use((req, res, next) => {
  // console.log(req.session);
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.get("/fakeUser", async (req, res) => {
//   const user = new User({ email: "testuser2@test.com", username: "tester1234" });
//   const newRegisteredUser = await User.register(user, "chicken");
//   res.send(newRegisteredUser);
// });

// Use the Router objects created in the routes folder
app.use("/campgrounds", campgroundsRoute);
app.use("/campgrounds/:id/reviews", reviewsRoute);
app.use("/", userRoute);

// ROUTES

// Homepage route
app.get("/", (req, res) => {
  res.render("home");
});

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
