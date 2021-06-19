const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

//Connect to the mongoDB database
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

//Handle connection error to mongoDB database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connection to database successful");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20 + 10);
    const camp = new Campground({
      author: "60cbb6483a0b193aa8f9bc42",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dhny1nvul/image/upload/v1624141068/YelpCamp/ow8emgkw7on6gajpwoch.jpg",
          filename: "YelpCamp/ow8emgkw7on6gajpwoch",
        },
        {
          url: "https://res.cloudinary.com/dhny1nvul/image/upload/v1624141072/YelpCamp/cn18swtuqjoy52uworhz.jpg",
          filename: "YelpCamp/cn18swtuqjoy52uworhz",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non eum amet odio. Exercitationem eius, quos quaerat hic eligendi voluptatibus eum possimus aliquam necessitatibus doloribus dolorem temporibus consequuntur ducimus. Repellat, beatae!",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
