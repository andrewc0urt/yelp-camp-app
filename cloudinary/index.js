const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
// first, set the cloudinary config (see cloudinary docs for more info, if needed)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Instantiate an instance of CloudinaryStorage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "YelpCamp", // folder in Cloudinary to store the campground images
//     format: async (req, file) => "png", // supports promises as well
//     public_id: (req, file) => "computed-filename-using-request",
//   },
// });

// const storage = new CloudinaryStorage({
//   cloudinary,
//   folder: "YelpCamp", // folder in Cloudinary to store the campground images
//   allowedFormats: ["jpeg", "png", "jpg"],
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

module.exports = { cloudinary, storage };
