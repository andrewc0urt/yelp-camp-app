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
// Commented out because I made images an array of image objects - so each image
// has a url and filename. These are hardcoded for simplicity, so seedRandomImg() isn't needed right now
// const seedRandomImg = async () => {
//   try {
//     const response = await axios.get(`https://api.unsplash.com/collections/9046579/photos/?client_id=${accessKey}`);
//     const unsplashObjectsArray = response.data;
//     const randomImgObject = sample(unsplashObjectsArray);
//     const imgURLs = randomImgObject.urls;
//     // console.log(imgURLs);
//     return imgURLs;
//   } catch (error) {
//     console.log("Error fetching image:", error);
//   }
// };

// Remove everything from DB first, then seed it
const seedDB = async () => {
  await Campground.deleteMany({});

  // loop through 8 times to create 8 new random campgrounds
  for (let i = 0; i < 250; i++) {
    const random1000 = Math.floor(Math.random() * 1000) + 1;
    // const randomImageURLs = await seedRandomImg();
    const price = Math.floor(Math.random() * 21) + 10; // random price b/w 10-30
    const camp = new Campground({
      author: "668ae98a57ffe838cb7872e7", // MY USER ID
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: randomImageURLs.regular,
      images: [
        {
          url: "https://res.cloudinary.com/dkbbw75ue/image/upload/v1720980223/YelpCamp/txwwy0wt3mj0pwhfmkz6.jpg",
          filename: "YelpCamp/txwwy0wt3mj0pwhfmkz6",
        },
        {
          url: "https://res.cloudinary.com/dkbbw75ue/image/upload/v1720980223/YelpCamp/p74xbcnhjxsypvrf7ojk.jpg",
          filename: "YelpCamp/p74xbcnhjxsypvrf7ojk",
        },
      ],
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
