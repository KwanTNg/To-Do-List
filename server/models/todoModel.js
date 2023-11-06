const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
  user_email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  date: Date,
});

module.exports = mongoose.model("Todo", todoSchema);
