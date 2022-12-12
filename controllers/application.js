const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");


module.exports = {
    getApplication: async (req, res) => {
      try {
        res.render("application.ejs", {user: req.user });
      } catch (err) {
        console.log(err);
      }
    }
    
  };
