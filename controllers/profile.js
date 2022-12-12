const cloudinary = require("../middleware/cloudinary");
const User = require("../models/User");


module.exports = {
    getProfile: async (req, res) => {
      try {
        res.render("profile.ejs", {user: req.user });
      } catch (err) {
        console.log(err);
      }
  },
  getEditProfile: async (req, res) => {
    try {
      res.render("editProfile.ejs", {user: req.user });
    } catch (err) {
      console.log(err);
    };
},
putSaveProfile: async (req, res) => {
  try {
    await User.findOneAndUpdate(  
      { _id: req.user.id },
      {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        branch: req.body.branch,
      }
      );
    res.redirect(`/profile`);
  } catch (err) {
    console.log(err);
  }
},   
  };