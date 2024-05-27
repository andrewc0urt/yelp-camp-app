const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const Campground = require("./models/campground");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const Joi = require("joi");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

// ROUTES
app.get("/", (req, res) => {
	res.render("home");
});

app.get(
	"/campgrounds",
	catchAsync(async (req, res) => {
		const allCampgrounds = await Campground.find({});
		res.render(`campgrounds/index`, { allCampgrounds });
	})
);

app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/newCampground");
});

app.post(
	"/campgrounds",
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground) {
		// 	throw new ExpressError("Invalid Campground Data", 400);
		// }

		// not a Mongoose schema; this uses Joi to validate a campground object before involving mongoose and saving to the database
		const campgroundSchema = Joi.object({
			campground: Joi.object({
				title: Joi.string().required(),
				price: Joi.number().required().min(0),
			}).required(),
			image: Joi.string().required(),
			location: Joi.string().required(),
			description: Joi.string().required(),
		});

		// const result = campgroundSchema.validate(req.body);
		// console.log(result);
		// console.log(result.error);

		// take the 'error' key from the resulting object after .validate(req.body)
		const { error } = campgroundSchema.validate(req.body);
		if (error) {
			// use map to iterate over each object in the 'details' array and extract the error message
			const msg = error.details.map((element) => element.message).join(",");
			console.log(msg);
			throw new ExpressError(msg, 400);
		}

		// console.log(result.error.details[0].message);

		// if (result.error) {
		// 	throw new ExpressError(result.error.details[0].message, 400);
		// }

		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.get(
	"/campgrounds/:id/edit",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		res.render("campgrounds/editCampground", { campground });
	})
);

app.put(
	"/campgrounds/:id",
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
		res.redirect(`/campgrounds/${updatedCampground._id}`);
	})
);

app.delete(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const deleteCampground = await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	})
);

app.get(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		res.render("campgrounds/showDetails", { campground });
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