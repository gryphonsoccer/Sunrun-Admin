const cloudinary = require("../middleware/cloudinary");
const AHJ = require("../models/AHJ");
const validator = require("validator");



const { PDFDocument, PageSizes,StandardFonts, rgb } = require("pdf-lib");
const path = require('path')
const { writeFileSync, readFileSync, readdirSync } = require("fs");

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');


module.exports = {
    getAhjEditor: async (req, res) => {
      try {
        let ahjDrillDown = false
        
        let editAHJ={editAHJ:false}
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjProperties = {
          ahjName:'',
          govType:'',
          address:'',
          city:'',
          contractPage: ''
      };
      res.render("ahjEditor.ejs", {ahjOfList:ahjOfList,ahjProperties:ahjProperties,ahjDrillDown:ahjDrillDown,editAHJ:editAHJ.editAHJ});
      } catch (err) {
        console.log(err);
      }
    },
    getAhjView: async (req, res) => {
      try {
        let ahjDrillDown = true
        let editAHJ={editAHJ:false}
        const validationErrors = [];
        let code = await req.query.ahjCode
        let editCode = await req.query.editAhj
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjPropertiesObject = {}
        let ahjProperties = await AHJ.find({ahjCode:code})
        let ahjPropertiesEdit = await AHJ.find({ahjCode:editCode})
        ahjPropertiesObject.ahjProperties = ahjProperties[0]
      
      

        if (!editCode && !code){
          validationErrors.push({ msg: "AHJ cannot be empty" });   
        }

        if (!editCode && ahjProperties.length==0){
          validationErrors.push({ msg: "AHJ not in system." });  
        }
        

        if (validationErrors.length) {
          req.flash("errors", validationErrors);
          return res.redirect("/ahjEditor");
        };

        res.render("ahjEditor.ejs", {ahjProperties:ahjPropertiesObject.ahjProperties, ahjOfList:ahjOfList,ahjDrillDown:ahjDrillDown,editAHJ:editAHJ.editAHJ});
      } catch (err) {
        console.log(err);
    }},
    getAddAhj: async (req, res) => {
      try {
        let ahjDrillDown = true
        let editAHJ={editAHJ:true}
        const validationErrors = [];
        //let code = await req.query.ahjCode
        let editCode = await req.query.editAhj
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjPropertiesObject = {}
        //let ahjProperties = await AHJ.find({ahjCode:code})
        let ahjProperties/*Edit*/ = await AHJ.find({ahjCode:editCode})
        ahjPropertiesObject.ahjProperties = ahjProperties[0]
        
 

        res.render("addAhjEditor.ejs", {ahjProperties:ahjPropertiesObject.ahjProperties, ahjOfList:ahjOfList,ahjDrillDown:ahjDrillDown,editAHJ:editAHJ.editAHJ});
      } catch (err) {
        console.log(err);
        
      }
    },
    postAhjEditor: async (req, res) => {
      try {
        let ahjDrillDown = true
        let editAHJ={editAHJ:false}
        const validationErrors = [];
        if (validator.isEmpty(req.body.ahjName))
        validationErrors.push({ msg: "AHJ name cannot be blank." });
        if (validator.isEmpty(req.body.govType))
        validationErrors.push({ msg: "AHJ type cannot be blank." });
        if (validator.isEmpty(req.body.state))
        validationErrors.push({ msg: "State type cannot be blank." });
        if (validationErrors.length) {
          req.flash("errors", validationErrors);
          return res.redirect("addAhj");
        };
        let newAhj = {};
        if(req.body.ahjName!=''){
          newAhj.ahjName = req.body.ahjName.toUpperCase().trim()
        };
        if(req.body.state!=''){
          newAhj.state = req.body.state.toUpperCase().trim()
        };
        if(req.body.govType!=''){
          newAhj.govType = req.body.govType.toUpperCase().trim()
        };
        if(req.body.nec!=''){
          newAhj.nec = req.body.nec
        };
        if(req.body.copies!=''){
          newAhj.copies = req.body.copies
        };
        if(req.body.deliverables){
          newAhj.deliverables = req.body.deliverables.trim()
        };
        if(req.body.contractPage){
          newAhj.contractPage = req.body.contractPage
        };
        if(req.body.costBreakdown!=''){
          newAhj.costBreakdown = req.body.costBreakdown
        };
        if(req.body.EEstamps!=''){
          newAhj.EEstamps = req.body.EEstamps
        };
        if(req.body.electricalLicense!=''){
          newAhj.electricalLicense = req.body.electricalLicense
        };
        if(req.body.icc!=''){
          newAhj.icc = req.body.icc
        };
        if(req.body.roofLicense!=''){
          newAhj.roofLicense = req.body.roofLicense
        };
        if(req.body.pics!=''){
          newAhj.pics = req.body.pics
        };
        if(req.body.interconnection!=''){
          newAhj.interconnection = req.body.interconnection
        };
        if(req.body.hoa!=''){
          newAhj.hoa = req.body.hoa
        };
        if(req.body.customerSignature!=''){
          newAhj.customerSignature = req.body.customerSignature
        };
        if(req.body.platSurvey!=''){
          newAhj.platSurvey = req.body.platSurvey
        };
        if(req.body.address!=''){
          newAhj.address = req.body.address
        };
        if(req.body.city!=''){
          newAhj.city = req.body.city
        };
        if(req.body.zip!=''){
          newAhj.zip = req.body.zip
        };
        if(req.body.phone!=''){
          newAhj.phone = req.body.phone
        };
        if(req.body.email!=''){
          newAhj.email = req.body.email
        };
        if(req.body.url!=''){
          newAhj.url = req.body.url
        };
        if(req.body.inspectionNotes!=''){
          newAhj.inspectionNotes = req.body.inspectionNotes
        };
        newAhj.ahjCode = await req.body.state + "-" + req.body.govType + " " + req.body.ahjName


        const query = { ahjCode: newAhj.ahjCode };
        const update = { $set: newAhj};
        const options = { upsert: true };
        await AHJ.updateOne(query, update, options);
        //await AHJ.create(newAhj);

        let ahjList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjProperties = await AHJ.find({ahjCode:newAhj.ahjCode})
        let ahjPropertiesObject = {}
    
        ahjPropertiesObject.ahjProperties = ahjProperties[0]
        res.render("ahjEditor.ejs", {ahjProperties:ahjPropertiesObject.ahjProperties, ahjOfList:ahjOfList,ahjDrillDown:ahjDrillDown,editAHJ:editAHJ.editAHJ});
        //res.render("ahjEditor.ejs", {ahjProperties:ahjPropertiesObject.ahjProperties,ahjOfList:ahjOfList, ahjList:ahjList,ahjDrillDown:ahjDrillDown,editAHJ:editAHJ.editAHJ});
      } catch (err) {
        console.log(err);
      }
    },
    getEditAhj: async (req, res) => { 
      try{

      
        const ahjDrillDown = true
        let editAHJ = true

        let ahjList = await AHJ.find().sort({ createdAt: "desc" }).lean()
  

        let code = await req.body.state + "-" + req.body.govType + " " + req.body.ahjName
   
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjProperties = await AHJ.find({ahjCode:code})

        if (!code){
          validationErrors.push({ msg: "AHJ cannot be empty" });
          
        }

        if (ahjProperties.length==0){
          console.log(ahjProperties);
          validationErrors.push({ msg: "AHJ not in system." });
          
        }
        

        if (validationErrors.length) {
          req.flash("errors", validationErrors);
          return res.redirect("/ahjEditor");
        };





        res.render("ahjEditor.ejs", {ahjProperties:ahjProperties, ahjOfList:ahjOfList, ahjList:ahjList,ahjDrillDown:ahjDrillDown,editAHJ:editAHJ});
      }catch(err){

      }
    },
    getApplication: async (req, res) => {
      try {
        console.log('O ley do it!')
        let ahjDrillDown = true
        let editAHJ={editAHJ:false}
        const validationErrors = [];
        let code = await req.query.application
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjPropertiesObject = {}
        let applicationFormImage = {}
        let ahjProperties = await AHJ.find({ahjCode:code})
        let url = {}
    
      
        ahjPropertiesObject.ahjProperties = ahjProperties[0]

        let applicationFormUrl = ahjProperties
        try{
          applicationFormImage.applicationFormImage = applicationFormUrl.split('.pdf')[0]+'.jpg'
        }catch(err){
          applicationFormImage.applicationFormImage = ""
        
        }
        
        try{
          url.url = cloudinary.url('pdf file folder//'+req.body.application, {
          resource_type: 'image',
          format: 'jpg'
        });
        }catch(err){
          url.url = ""
        
        }
      
      

        if (!code){
          console.log(code);
          validationErrors.push({ msg: "AHJ cannot be empty" });
          
        }

      

        if (validationErrors.length) {
          req.flash("errors", validationErrors);
          return res.redirect("/ahjEditor");
        };

        const applicationForm = await PDFDocument.load(readFileSync(path.join(process.cwd(),'Des Plaines Application.pdf')));
        const pdfDataUri = await applicationForm.saveAsBase64({ dataUri: true });
        let imageUrl = ""
        
        res.render("ahjApplicationForm.ejs", {
          ahjProperties:ahjPropertiesObject.ahjProperties,
           ahjOfList:ahjOfList,
           ahjDrillDown:ahjDrillDown,
           applicationFormUrl:applicationFormUrl,
           applicationFormImage:applicationFormImage.applicationFormImage,
           background: url.url,
           imageUrl: imageUrl
        
          });
      
      } catch (err) {
        console.log(err);
        
      }
    },
    postApplication: async (req, res) => {
      try {
        let applicationForm = await cloudinary.api.resources({resource_type : 'raw',folder:'pdf file folder',public_id : 'pdf file folder//'+req.body.application})
        let applicationFormUrl = applicationForm.resources[0].url
        let code = await req.body.application
        let ahjProperties = await AHJ.find({ahjCode:code})
        let ahjDrillDown = true
        let editAHJ={editAHJ:true}
        const validationErrors = [];
        //let code = await req.query.ahjCode
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjPropertiesObject = {}
        ahjPropertiesObject.ahjProperties = ahjProperties[0]
        console.log(applicationForm.resources[0].url)
        let transfrom = 'pdf file folder//'+req.body.application.split('.pdf')[0]+'.jpg'
        //let applicationFormImage = applicationFormUrl.split('.pdf')[0]+'.jpg'
        let applicationFormImage = cloudinary.image(transfrom, {width: 816, height: 1056})
        console.log(applicationFormImage)
      
        const url = cloudinary.url('pdf file folder//'+req.body.application, {
          resource_type: 'image',
          format: 'jpg'
        });


        //Try at work
        //https://res.cloudinary.com/da1maltxw/raw/upload/v1674681369/pdf%20file%20folder/IL-CITY%20DES%20PLAINES.pdf
        let pleaseWork = await cloudinary.uploader.upload(
          'https://res.cloudinary.com/da1maltxw/raw/upload/v1674681369/pdf%20file%20folder/IL-CITY%20DES%20PLAINES.pdf',
          {
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { effect: 'replace_color:f3f3f3:000000' },
              { background: 'white' },
              { format: 'jpg' }
            ]
          },
        )
        const imageUrl = pleaseWork.url
        console.log(pleaseWork)
        console.log(imageUrl)
        res.render("ahjApplicationForm.ejs", {
          ahjProperties:ahjPropertiesObject.ahjProperties, 
          ahjOfList:ahjOfList,
          ahjDrillDown:ahjDrillDown,
          editAHJ:editAHJ.editAHJ,
          applicationFormUrl:applicationFormUrl,
          applicationFormImage:applicationFormImage,
          background: url,
          imageUrl: imageUrl
        });
      
      } catch (err) {
        console.log(err);
        
      }
    },
  };