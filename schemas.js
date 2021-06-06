const Joi = require("joi");
//Although we have input validations in the form, we can still send wrong data through POSTMAN
//We are validating the input using Joi, we are defining the Schema for validation
//This is not the actual SCHEMA
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});
