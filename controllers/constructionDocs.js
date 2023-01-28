const cloudinary = require("../middleware/cloudinary");
//const { uploadFile } = require("../middleware/S3");
const Post = require("../models/Post");
const fs = require('fs')
const extract = require('extract-zip')
const jszip = require('jszip')
const helpers = require("../helpers/fileHandler");
const CDhelpers = require("../helpers/constructionDocs");
const { collection } = require("../models/Post");
const path = require('path');
const { urlencoded } = require("express");
const { ALL } = require("dns");



module.exports = {
    getConstructionDocs: async (req, res) => {
      try {
        let deliverableErrors = {zipError:[],pdfError:[]}
        let deliverables = await cloudinary.api.resources({resource_type : 'raw',max_results: 1})
        let mergedConstructionDocumentsFolder = fs.readdirSync(path.join(process.cwd(),'Merged Construction Documents'))
        let constructionDocsFolder = fs.readdirSync(path.join(process.cwd(),'Construction Documents'))
        let folderLabelsFolder = fs.readdirSync(path.join(process.cwd(),'Folder Labels'))
        let mergedConstructionDocumentsList = []
        let constructionDocsList = []
        let folderLabelsList = []
        for(i=0;i<mergedConstructionDocumentsFolder.length;i++){
          mergedConstructionDocumentsList.push({id:i+1,mergedConstructionDocumentsFolder:mergedConstructionDocumentsFolder[i]
          })
        }
        for(i=0;i<constructionDocsFolder.length;i++){
          constructionDocsList.push({id:mergedConstructionDocumentsList.length+i+1,constructionDocsFolder:constructionDocsFolder[i]
          })
        }
        for(i=0;i<folderLabelsFolder.length;i++){
        folderLabelsList.push({id:constructionDocsFolder.length+mergedConstructionDocumentsFolder.length+i+1,folderLabelsFolder:folderLabelsFolder[i]
          })
        }
        res.render("constructionDocs.ejs", {
          user: req.user,
          deliverables: deliverables,
          mergedConstructionDocumentsList:mergedConstructionDocumentsList,
          constructionDocsList:constructionDocsList,
          folderLabelsList:folderLabelsList,
          deliverableErrors: deliverableErrors
        });
      } catch (err) {
        console.log(err);
      }
    },
    postConstructionDocs: async (req, res) => {
      try {
        let publicIdList = []
        let deliverableErrors = {zipError:[],pdfError:[]}
        let deliverables = await cloudinary.api.resources({resource_type : 'raw',folder:'zip file folder'})
     
        
        //Unzip folder
        console.log(deliverables.resources.length)

        const GetZip = async (url) => {
          await helpers.unzip(url)
        }
        
        //await GetZip()

        const GetUnzip = async () => {
          let unzippedDeliverables = fs.readdirSync(path.join(process.cwd(),'dist'))
          let collectedVariables = await helpers.collection(unzippedDeliverables)
          return collectedVariables
        }
        

        for(i=0;i<deliverables.resources.length;i++){
          await GetZip(deliverables.resources[i].url)
          let collectedVariables = await GetUnzip()
          try{
            await CDhelpers.createConstructionDocs(collectedVariables.deliverablesList.CD,collectedVariables.deliverablesList.unstampedPlans,collectedVariables.cdVariablesList).catch((err) => console.log(err,'poooooooooop'));
            await CDhelpers.createLabel(collectedVariables.cdVariablesList)
          
          }catch(err){
            deliverableErrors.zipError.push(deliverables.resources[i].public_id.split('/')[1])
            console.log(deliverableErrors)
          }
          try{
            await CDhelpers.createPDF(collectedVariables.cdVariablesList)
          }catch(err){
            console.log(err)
          }
          let constructionDocsFolder = fs.readdirSync(path.join(process.cwd(),'Construction Documents'))
          console.log(constructionDocsFolder[0])
          let dist = fs.readdirSync(path.join(process.cwd(),'dist'))
          helpers.clearDocs (dist,'dist')
        
          publicIdList.push(deliverables.resources[i].public_id)
        }

        await cloudinary.api.delete_resources(publicIdList,{resource_type : 'raw'})
        let newDeliverables = await cloudinary.api.resources({resource_type : 'raw'})
        console.log(newDeliverables.resources.length)


        let constructionDocsFolder = fs.readdirSync(path.join(process.cwd(),'Construction Documents'))
        let folderLabelsFolder = fs.readdirSync(path.join(process.cwd(),'Folder Labels'))


        let compareConstructionDocs = constructionDocsFolder.map(el =>el.split(' ')[0])
        let compareLabels = folderLabelsFolder.map(el =>el.split(' ')[0])

        compareLabels.forEach(el=>{
          if(!compareConstructionDocs.includes(el)){
            deliverableErrors.pdfError.push(el)
          }
        })




        let mergedConstructionDocumentsFolder = fs.readdirSync(path.join(process.cwd(),'Merged Construction Documents'))
        let mergedConstructionDocumentsList = []
        let constructionDocsList = []
        let folderLabelsList = []
        for(i=0;i<mergedConstructionDocumentsFolder.length;i++){
          mergedConstructionDocumentsList.push({id:i+1,mergedConstructionDocumentsFolder:mergedConstructionDocumentsFolder[i]
          })
      }
      for(i=0;i<constructionDocsFolder.length;i++){
        constructionDocsList.push({id:mergedConstructionDocumentsList.length+i+1,constructionDocsFolder:constructionDocsFolder[i]
          })
      }
      for(i=0;i<folderLabelsFolder.length;i++){
        folderLabelsList.push({id:constructionDocsFolder.length+mergedConstructionDocumentsFolder.length+i+1,folderLabelsFolder:folderLabelsFolder[i]
          })
      }
        res.render("constructionDocs.ejs", {
          user: req.user,
          deliverables: deliverables,
          mergedConstructionDocumentsList:mergedConstructionDocumentsList,
          constructionDocsList:constructionDocsList,
          folderLabelsList:folderLabelsList,
          deliverableErrors:deliverableErrors 
        });
      } catch (err) {
        console.log(err);
        res.render("constructionDocs.ejs");
      }
    },
    deleteConstructionDocs: async (req, res) => {
      let constructionDocumentsFolder = fs.readdirSync(path.join(process.cwd(),'Construction Documents'))
      if(constructionDocumentsFolder.length>0){
        helpers.clearDocs (constructionDocumentsFolder,'Construction Documents')
      }
      res.redirect('/ConstructionDocs')
    },
    deleteLabels: async (req, res) => {
      let labelFolder = fs.readdirSync(path.join(process.cwd(),'Folder Labels'))
      let inspectionNotesFolder = fs.readdirSync(path.join(process.cwd(),'Inspection Notes'))
      if(labelFolder.length>0){
        helpers.clearDocs (labelFolder,'Folder Labels')
        helpers.clearDocs (inspectionNotesFolder,'Inspection Notes')
      }
      res.redirect('/ConstructionDocs')
    },
    deleteMergedDocs: async (req, res) => {
      let mergedDocsFolder = fs.readdirSync(path.join(process.cwd(),'Merged Construction Documents'))
      if(mergedDocsFolder.length>0){
        helpers.clearDocs (mergedDocsFolder,'Merged Construction Documents')
      }
      res.redirect('/ConstructionDocs')
    },
    mergeDocs: async (req, res) => {
      let constructionDocumentsFolder = fs.readdirSync(path.join(process.cwd(),'Construction Documents'))
      let labelFolder = fs.readdirSync(path.join(process.cwd(),'Folder Labels'))
      let inspectionNotesFolder = fs.readdirSync(path.join(process.cwd(),'Inspection Notes'))
      if(constructionDocumentsFolder.length>0){
        await CDhelpers.mergeDocs ('Construction Documents',constructionDocumentsFolder)
      }
      if(labelFolder.length>0){
        await CDhelpers.mergeDocs ('Folder Labels',labelFolder)
      }
      if(inspectionNotesFolder.length>0){
        await CDhelpers.mergeDocs ('Inspection Notes',inspectionNotesFolder)
      }
      res.redirect('/ConstructionDocs')
    },
    downloadDocs: async (req, res) => {
      CDhelpers.downloadDocs(req,res)
    }
  };
