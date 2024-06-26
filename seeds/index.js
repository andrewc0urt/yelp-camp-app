const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const axios = require("axios");

require("dotenv").config();
const accessKey = process.env.UNSPLASH_ACCESS_KEY;

// Connect mongoose
main().catch((err) => console.log(err));

async function main() {
	await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp-app", {});
	console.log("Database is connected.");
}

// function to pass an array and return a random element from the array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// function to return a random image from a collection using the Unsplash API
const seedRandomImg = async () => {
	try {
		const response = await axios.get(
			`https://api.unsplash.com/collections/9046579/photos/?client_id=${accessKey}`
		);
		const unsplashObjectsArray = response.data;
		const randomImgObject = sample(unsplashObjectsArray);
		const imgURLs = randomImgObject.urls;
		console.log(imgURLs);
		return imgURLs;
	} catch (error) {
		console.log("Error fetching image:", error);
	}
};

// Remove everything from DB
const seedDB = async () => {
	await Campground.deleteMany({});

	// loop through 50 times to create 50 new random campgrounds
	for (let i = 0; i < 8; i++) {
		const random1000 = Math.floor(Math.random() * 1000) + 1;
		const randomImageURLs = await seedRandomImg();
		const price = Math.floor(Math.random() * 21) + 10; // random price b/w 10-30
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			image: randomImageURLs.regular,
			description:
				"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt repellendus nostrum molestiae unde vero velit impedit odio nobis, nulla, id non autem doloremque perferendis natus, odit commodi eveniet ea ex. Et facilis consequuntur, natus, porro aperiam quasi culpa atque dicta nemo minus asperiores! Voluptates tempore suscipit, impedit aliquam cupiditate laboriosam magnam rerum expedita qui quidem illum? Obcaecati id sapiente et.",
			price: price,
		});

		// save the new campground
		await camp.save();
	}
};

// Call the seedDB function and then close the database
seedDB().then(() => {
	mongoose.connection.close();
	console.log("Database has successfuly disconnected.");
});
