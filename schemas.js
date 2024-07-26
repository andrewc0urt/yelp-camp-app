const Joi = require("joi");

// Define the JOI schema for the geometry object
// This schema will validate the structure of the geometry object which includes:
// - `type`: A string that must be "Point" to specify the type of GeoJSON object
// - `coordinates`: An array that must contain exactly two numbers representing the latitude and longitude
// The `geometrySchema` is required and will be included in the main `campgroundSchema`
const geometrySchema = Joi.object({
  type: Joi.string().valid("Point").required(),
  coordinates: Joi.array().items(Joi.number()).length(2).required(),
}).required();

// Define the main JOI schema for campground validation
// This schema ensures the main properties of a campground are validated, including:
// - `title`: A required string
// - `price`: A required number that must be non-negative
// - `location`: A required string
// - `description`: A required string
// - `geometry`: The nested geometry object, validated by the `geometrySchema`
const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    description: Joi.string().required(),
    geometry: geometrySchema.required(), // Include the geometry schema here and mark it as required
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.campgroundSchema = campgroundSchema;

const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

module.exports.reviewSchema = reviewSchema;
