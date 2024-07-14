const Campground = require("../models/campground");

// logic to render all the campgrounds
const index = async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render(`campgrounds/index`, { allCampgrounds });
};

// logic to render the new campground form for the user
const getNewCampgroundForm = (req, res) => {
  res.render("campgrounds/newCampground");
};

// logic to create a new campground after user submits it
const createNewCampground = async (req, res, next) => {
  // if (!req.body.campground) {
  // 	throw new ExpressError("Invalid Campground Data", 400);
  // }

  const campground = new Campground(req.body.campground);
  // map over req.files taking the path and filename for each file object and store it in an image object
  // then each image gets stored in an array of images, where images is a property of the Campground object
  campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully created a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// logic to render the Edit campground form
const getEditCampgroundForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Uh-oh, that campground was not found!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/editCampground", { campground });
};

// logic to update a campround upon submission of the Edit campground form
const updateCampground = async (req, res) => {
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
};

// logic to delete a campground
const deleteCampground = async (req, res) => {
  const { id } = req.params;
  const deleteCampground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};

// logic to render the showDetails page to display information about a specific campground
const showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  // console.log(campground);
  if (!campground) {
    req.flash("error", "Uh-oh, that campground was not found!");
    return res.redirect("/campgrounds");
  }
  // console.log(campground);
  res.render("campgrounds/showDetails", { campground });
};

module.exports = { index, getNewCampgroundForm, createNewCampground, getEditCampgroundForm, updateCampground, deleteCampground, showCampground };
