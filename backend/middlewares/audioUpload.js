const multer = require('multer');
const ErrorHandler = require('../utils/errorHandler');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 300000000
    },
    fileFilter: (req, file, cb) => {
        console.log('request', file);
        if (file.mimetype.startsWith('audio')) {
            cb(null, true)
        } else {
            cb(new ErrorHandler("Please upload audio file.", 400), false);
        }
    }
});

const singleAudio = (audioType) => upload.single(audioType);
// const multipleImage = (imageType) => upload.array(imageType, 5);
// const anyImage = () => upload.any();

module.exports = { singleAudio }