const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Create a custom JOI extension to sanitize HTML input in strings
// This extension will help prevent XSS attacks by removing any HTML tags and attributes
const extension = (joi) => ({
  type: "string", // Define this extension to be applicable to string types only
  base: joi.string(), // Extend the base string type from JOI
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!", // Custom error message if HTML is found
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        // Use the sanitizeHtml library to clean the input string
        const clean = sanitizeHtml(value, {
          allowedTags: [], // Remove all HTML tags
          allowedAttributes: {}, // Remove all HTML attributes
        });

        // If the sanitized value is different from the original, it means HTML was removed
        if (clean !== value) {
          return helpers.error("string.escapeHTML", { value }); // Return an error indicating HTML was found
        }
        return clean; // Return the sanitized string if no HTML was found
      },
    },
  },
});

// Extend the base JOI with the custom extension
// This allows the use of the escapeHTML method in the schemas below without changing the JOI variable names
const Joi = BaseJoi.extend(extension);

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
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
    geometry: geometrySchema.required(), // Include the geometry schema here and mark it as required
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.campgroundSchema = campgroundSchema;

const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

module.exports.reviewSchema = reviewSchema;
