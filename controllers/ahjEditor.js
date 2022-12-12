const cloudinary = require("../middleware/cloudinary");
const AHJ = require("../models/AHJ");
const validator = require("validator");

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');


module.exports = {
    getAhjEditor: async (req, res) => {
      try {
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjProperties = {
          ahjName:'',
          govType:'',
          address:'',
          city:'',
          contractPage: ''
      };
      console.log(ahjProperties.contractPage)
      res.render("ahjEditor.ejs", {ahjOfList:ahjOfList,ahjProperties:ahjProperties});
      } catch (err) {
        console.log(err);
      }
    },
    getAhjView: async (req, res) => {
      try {
        const validationErrors = [];
        let code = await req.query.ahjCode
        let ahjOfList = await AHJ.find().sort({ createdAt: "desc" }).lean()
        let ahjProperties = await AHJ.find({ahjCode:code})
        console.log(ahjProperties)
        let errorAhjProperties = {
          ahjName:'booty',
          govType:'',
          address:'',
          city:'',
          contractPage: ''
      };

        if (!code){
          console.log(code);
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


        res.render("ahjEditor.ejs", {ahjProperties:ahjProperties[0], ahjOfList:ahjOfList});
      } catch (err) {
        console.log(err);
    }},
    getAddAhj: async (req, res) => {
      try {
        
        res.render("addAhjEditor.ejs");
      } catch (err) {
        console.log(err);
        
      }
    },
    postAhjEditor: async (req, res) => {
      try {
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
          newAhj.ahjName = req.body.ahjName.toUpperCase()
        };
        if(req.body.state!=''){
          newAhj.state = req.body.state.toUpperCase()
        };
        if(req.body.govType!=''){
          newAhj.govType = req.body.govType
        };
        if(req.body.nec!=''){
          newAhj.nec = req.body.nec
        };
        if(req.body.copies!=''){
          newAhj.copies = req.body.copies
        };
        if(req.body.deliverables!=''){
          newAhj.deliverables = req.body.deliverables
        };
        if(req.body.contractPage!=''){
          newAhj.contractPage = req.body.contractPage
        };
        if(req.body.costBreakdown!=''){
          newAhj.costBreakdown = req.body.costBreakdown
        };
        if(req.body.EEstamps!=''){
          newAhj.EEstamps = req.body.EEstamps
        };
        if(req.body.electricalLicense!=''){
          newAhj.contractPage = req.body.electricalLicense
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
        newAhj.ahjCode = req.body.state + "-" + req.body.govType + " " + req.body.ahjName
        await AHJ.create(newAhj);

        let ahjList = await AHJ.find().sort({ createdAt: "desc" }).lean()

        let ahjProperties = await AHJ.find({ahjName:req.body.ahjName})
        res.render("ahjEditor.ejs", {ahjProperties:ahjProperties, ahjList:ahjList});
      } catch (err) {
        console.log(err);
      }
    },
    
  };