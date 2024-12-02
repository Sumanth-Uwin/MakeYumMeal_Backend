const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const PwdComlexity = require("joi-password-complexity");

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SESSION_SECRET, { expiresIn: "7d" });
  return token;
};

const UserModel = mongoose.model("user", UserSchema);

// Validation schema
const validate = (data) => {
  const schema = joi.object({
    firstName: joi.string().required().label("First Name"),
    lastName: joi.string().required().label("Last Name"),
    email: joi.string().email().required().label("Email"),
    password: PwdComlexity().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = { UserModel, validate };
