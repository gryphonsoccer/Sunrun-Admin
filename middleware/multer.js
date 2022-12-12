const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    use_filename: true,
    tag:'deliverable',
    resource_type:"raw",
    folder: async (req,file)=>{
      //console.log(file)
      let ext = path.extname(file.originalname);
      if (ext == ".pdf") {
        console.log('This should end up in the pdf folder')
        return 'pdf file folder'
      }else if (ext == ".png") {
        console.log('This should end up in the png folder')
        return 'png file folder'
      }else if (ext == ".zip") {
        console.log('This should end up in the zip folder')
        return 'zip file folder'
      }
    },
    format: async (req,file)=>{
      //console.log(req.route)
      let ext = path.extname(file.originalname);
      if (ext == ".zip") {
        return 'zip'
      }else if (ext == ".pdf") {
        return 'pdf'
      }
    },
  },
});
module.exports =  multer({
  storage: storage
});
