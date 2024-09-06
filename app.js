if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000; // default deployment port or local port 3000 if in development
const Campground = require("./models/campground");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const userRoute = require("./routes/users");
const campgroundsRoute = require("./routes/campgrounds");
const reviewsRoute = require("./routes/reviews");
const User = require("./models/user");
const { name } = require("ejs");

// Define the database URL based on the environment
const databaseUrl = process.env.NODE_ENV !== "production" ? "mongodb://127.0.0.1:27017/yelp-camp-app" : process.env.MONGO_DB_ATLAS_URL;

// Trust the first proxy in the chain for correct IP and protocol info
// Necessary when behind a reverse proxy or load balancer (like in Fly.io)
app.set("trust proxy", 1);

// const databaseUrl = process.env.MONGO_DB_ATLAS_URL || "mongodb://127.0.0.1:27017/yelp-camp-app";

// Connects to the MongoDB cluster - Live Production
async function main() {
  await mongoose.connect(databaseUrl, {});
  console.log("MongoDB ATLAS is successfully connected.");
}

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

// tell express to serve up the public folder with static files
app.use(express.static(path.join(__dirname, "public")));

// middleware to use express-mongo-sanitize to prevent nosql injection attacks
app.use(mongoSanitize());

// Secret key to be used in session configuration
// SECRET will be a configured environment variable at deployment
const secret = process.env.SECRET || "development-backup-secret-key";

// Using connect-mongo to create a new connection from a MongoDB connection string
// Straight from the documentation of 'connect-mongo'

// Create a session store using MongoDB with connect-mongo
// The 'mongoUrl' specifies the database connection string
// The `touchAfter` option ensures that the session is only updated in the database once within a specified time period (in seconds),
// even if the session data hasn't changed. This helps to reduce unnecessary writes to the database.
// The 'crypto.secret' is used to sign the session ID cookie, adding an extra layer of security

const store = MongoStore.create({
  mongoUrl: databaseUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret, // Key used to encrypt session data
  },
});

// Configure the session settings using express-session
// 'store' specifies that sessions will be stored in MongoDB instead of the default memory store
const sessionConfig = {
  store,
  name: "yelpCamp_session", // name of the session cookie
  secret,
  resave: false, // Don't resave session if unmodified
  saveUninitialized: true, // Save uninitialized sessions to the store
  cookie: {
    httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client-side scripts
    secure: process.env.NODE_ENV === "production", // this cookie should only work on https (not http or localhost) in production
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Cookie expires in 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie max age of 7 days
  },
};
app.use(session(sessionConfig));
app.use(flash());

// Use Helmet!
app.use(helmet());

// Define an array of allowed sources for script tags
const scriptSrcUrls = ["https://stackpath.bootstrapcdn.com/", "https://api.tiles.mapbox.com/", "https://api.mapbox.com/", "https://kit.fontawesome.com/", "https://cdnjs.cloudflare.com/", "https://cdn.jsdelivr.net", "https://code.jquery.com/"];

// Define an array of allowed sources for style tags
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];

// Define an array of allowed sources for connections
const connectSrcUrls = ["https://api.mapbox.com/", "https://a.tiles.mapbox.com/", "https://b.tiles.mapbox.com/", "https://events.mapbox.com/"];

// Define an array of allowed sources for font files
const fontSrcUrls = ["https://cdn.jsdelivr.net/"];

// Configure the Content Security Policy (CSP) using Helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [], // Default policy that disallows all sources
      connectSrc: ["'self'", ...connectSrcUrls], // Allowed sources for AJAX/fetch requests
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls], // Allowed sources for scripts
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls], // Allowed sources for styles
      workerSrc: ["'self'", "blob:"], // Allowed sources for web workers and blobs
      objectSrc: [], // Disallow all <object>, <embed>, and <applet> tags
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dkbbw75ue/", //SHOULD MATCH CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://cdn.jsdelivr.net/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls], // Allowed sources for fonts
    },
  })
);

// Connect mongoose
main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp-app", {});
//   console.log("Database is successfully connected.");
// }

// const validateReview = (req, res, next) => {
//   const { error } = reviewSchema.validate(req.body);

//   if (error) {
//     const msg = error.details.map((element) => element.message).join(",");
//     throw new ExpressError(msg, 400);
//   } else {
//     next();
//   }
// };

// middleware required to use passport (see docs for more)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // tell passport to use LocalStrategy, pass the User model and authenticate it

// maintain a login session for a user (store and unstore sessions)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use((req, res, next) => {
  // console.log("Current user:", req.user); // Add this line to see who's currently logged in
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
