const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = 3000;
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
	await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {});
	console.log("Database is successfully connected.");
}

app.listen(port, () => {
	console.log(`YelpCamp app listening on port ${port}`);
});

// ROUTES
app.get("/", (req, res) => {
	res.send("Express App is working");
});
