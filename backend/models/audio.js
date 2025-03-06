const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
      trim: true,
    },
    audio: {
      public_id: String,
      url: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Audio = mongoose.model("audio", audioSchema);

module.exports = Audio;
