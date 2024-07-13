const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
// const { isLoggedIn } = require("../middleware");
const { validateCampground, isLoggedIn, isAuthor } = require("../middleware");

// require the storage to store files in the storage created in cloudinary/index.js
const { storage } = require("../cloudinary"); // dont need to include the /index.js b/c node automatically looks for an index.js file

// use the multer middleware for uploading image files
const multer = require("multer");
const upload = multer({ storage });

// import the route logic (functions) from controllers
const campgroundController = require("../controllers/campgrounds");

// use router.route to avoid duplicate route naming; handles http verbs based on the single route it should it
// below, the .get route and .post route have the route campgrounds/, but different HTTP verbs
// router.route("/").get(catchAsync(campgroundController.index)).post(isLoggedIn, validateCampground, catchAsync(campgroundController.createNewCampground));
router
  .route("/")
  .get(catchAsync(campgroundController.index))
  .post(upload.array("image", 2), (req, res, next) => {
    console.log(req.body, "-----------", req.files);
    res.send("Check console!");
  });

// router.get("/", catchAsync(campgroundController.index));

router.get("/new", isLoggedIn, campgroundController.getNewCampgroundForm);

// router.post("/", isLoggedIn, validateCampground, catchAsync(campgroundController.createNewCampground));

// use router.route to refactor the :id routes that are the same, but have different http verbs
router
  .route("/:id")
  .get(catchAsync(campgroundController.showCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground))
  .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgroundController.getEditCampgroundForm));

// router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground));

// router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

// router.get("/:id", catchAsync(campgroundController.showCampground));

// export the router to be used in router.js
module.exports = router;
