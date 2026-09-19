const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// `mongoose.models.User ||` prevents "OverwriteModelError" on warm re-use
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
