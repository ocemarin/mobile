const multer = require('multer');
const ErrorHandler = require('../utils/errorHandler');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 300000000
    },
    fileFilter: (req, file, cb) => {
        console.log('in upload ', file);
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new ErrorHandler("Please upload image file.", 400), false);
        }
    }
});

const singleImage = (imageType) => upload.single(imageType);
const multipleImage = (imageType) => upload.array(imageType, 5);
const anyImage = () => upload.any();

module.exports = { singleImage, multipleImage, anyImage }