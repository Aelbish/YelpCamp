//This is the file that creates the model

const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

//This option allows to add the virtual properties in the JSON object, this is used in CampgroundSchema.virtual
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: {
      type: String,
    },
    images: [ImageSchema],
    price: {
      type: Number,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: {
      type: String,
    },
    location: {
      type: String,
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
  },
  //this opts represents properties attribute that is defined in the virtual below
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.location}</p>`;
});

//This middleware (findOneAndDelete) is triggered when findByIdandDelete is executed according to mongoose docs
//This is executed from the delete route for a campgoround
//This middleware is used to delete all the reviews associated with a campground when a campground is deleted
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
