const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const CampgroundSchema = new Schema({
  title: String,
  images: [
    // each campground will have 1 or more images stored in an array
    {
      url: String, // each image will have a url and a filename
      filename: String,
    },
  ],
  price: Number,
  description: String,
  location: String,
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
