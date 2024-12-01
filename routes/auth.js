const router = require("express").Router();
const { UserModel } = require("../models/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");

router.post("/", async (req, res) => {
  try {
    // Validate the incoming request data
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Find the user by email
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // Generate the JWT token
    const token = 1234;

    // Send back the token along with user info (optional fields)
    res.status(200).send({
      data: {
        token,
        userId: user._id,
        email: user.email, // You can include other user details as needed
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Validation schema
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
