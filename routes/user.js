const router = require("express").Router();
const { UserModel, validate } = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    // Validate the incoming request data
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check if the user already exists with the same email
    const user = await UserModel.findOne({ email: req.body.email });
    if (user)
      return res.status(409).send({ message: "User with given email already exists!" });

    // Hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Save the new user to the database, including firstname and lastname
    await new UserModel({
      firstname: req.body.firstName, // Save first name
      lastname: req.body.lastName,   // Save last name
      email: req.body.email,
      password: hashPassword,
    }).save();

    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
