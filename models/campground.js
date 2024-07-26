const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

// Image schema
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// https://res.cloudinary.com/dkbbw75ue/image/upload/c_fill,h_250,w_250/v1721174260/YelpCamp/t7hl13cldkxariuqyb35.jpg

// Create a virtual property for ImageSchema so that every image has this virtual property
// Replace part of the original url with a portion to convert it to a thumbnail using
// Cloudinary's Transformations API
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/c_fill,h_200,w_200");
});

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema], // each campground will have 1 or more images stored in an array
  price: Number,
  description: String,
  location: String,

  // Define the geometry property for storing GeoJSON data
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // Coordinates are an array of numbers [longitude, latitude]
      required: true,
    },
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Middleware to delete all associated reviews when a campground is deleted
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Remove all reviews from the Review collection where the _id field is in the doc reviews array
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
