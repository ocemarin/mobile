const cloudinary = require("cloudinary").v2;
const database = require("./config/connect");
const app = require("./app");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT;

// database connect
database();

// cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

app.listen(port, () => {
  console.log(`Server started at port:${port}`);
});
