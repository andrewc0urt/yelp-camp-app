const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review')

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,

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
