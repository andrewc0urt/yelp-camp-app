const Joi = require("joi");

// not a Mongoose schema; this uses Joi to validate a campground object before involving mongoose and saving to the database
const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
});

module.exports.campgroundSchema = campgroundSchema