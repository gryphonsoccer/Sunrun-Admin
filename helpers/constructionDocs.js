const AHJ = require("../models/AHJ");
const { PDFDocument, PageSizes,StandardFonts, rgb } = require("pdf-lib");
const path = require('path')
const { writeFileSync, readFileSync, readdirSync } = require("fs");

async function createPDF(project) {
  const PDFdoc = await PDFDocument.create();
  const page = PDFdoc.addPage(PageSizes.Letter);
  const helvetica = await PDFdoc.embedFont(StandardFonts.Helvetica);
  
  
  

  let ahjProperties = await AHJ.find({ahjCode:project.ahj})
  let inspectionNotesList = ahjProperties[0].inspectionNotes

  page.drawText(project.jobCode, {
    x: 35,
    y:750,
    font: helvetica,
    size: 12,
    });
 
  //page.moveTo(1275,2770);
  page.drawText(project.ahj, {
    x: 290,
    y:712,
    font: helvetica,
    size: 12,
    });
        
  //page.moveTo(330,2440);
  page.drawText(inspectionNotesList, {
    x:35,
    y:670,
    font: helvetica,
    size: 11,
    maxWidth:500,
    lineHeight:15,
    });
      
    
  writeFileSync(path.join(process.cwd(),'Inspection Notes\\'+project.jobCode+","+project.ahj+" Insection Notes.pdf"), await PDFdoc.save());   
}
  
exports.createPDF = createPDF;

async function createLabel(project) {
    const constructionLabel = await PDFDocument.load(readFileSync(path.join(process.cwd(),'public\\imgs\\Construction Label.pdf')));
    const helvetica = await constructionLabel.embedFont(StandardFonts.Helvetica);
    const firstPage = constructionLabel.getPage(0);
    //Job Code
    firstPage.moveTo(38,520);
    firstPage.drawText(project.jobCode, {
        font: helvetica,
        size: 12,
      });

    //address
    firstPage.moveTo(38,458.8);
    firstPage.drawText(project.fullAddress, {
        font: helvetica,
        size: 12,
      });
    //Scope of WOrk
    firstPage.moveTo(198,397.6);
    firstPage.drawText('Scope of Work', {
        font: helvetica,
        size: 12,
      });

    //System Size
    firstPage.moveTo(38,336.4);
    firstPage.drawText(project.systemSizeDC+'W DC', {
        font: helvetica,
        size: 12,
      });

    //Modules
    firstPage.moveTo(38,265.2);
    firstPage.drawText(project.modules, {
        font: helvetica,
        size: 12,
      });

    //Inverter
    firstPage.moveTo(38, 188);
    firstPage.drawText(project.inverters[0], {
        font: helvetica,
        size: 12,
      });


    //Customer phone
    firstPage.moveTo(38, 142.8);
    firstPage.drawText(project.phone, {
        font: helvetica,
        size: 12,
      });

    //Inspection Notes 
    

    let ahjProperties = await AHJ.find({ahjCode:project.ahj})
    if(ahjProperties[0]){
      if(project.ahj/*ahjProperties[0].inspectionNotes*/){
        firstPage.moveTo(534,581.2);
        firstPage.drawText(project.ahj, {
        font: helvetica,
        size: 12,
      });


        
        let inspectionNotesList = ahjProperties[0].inspectionNotes
      
  
        if(inspectionNotesList){
          firstPage.moveTo(534,581.2);
          firstPage.drawText(project.ahj, {
            font: helvetica,
            size: 12,
          });

          firstPage.moveTo(410,560);
          firstPage.drawText(inspectionNotesList, {
            font: helvetica,
            size: 11,
            maxWidth:380,
            lineHeight:15,
          });
        }
        
      }
    }
    



    writeFileSync(path.join(process.cwd(),'Folder Labels\\'+project.jobCode+" Folder Label.pdf"), await constructionLabel.save());
  }

  exports.createLabel = createLabel;

async function createConstructionDocs(constructionDoc,plans, project) {
  const constructionDocMerge = await PDFDocument.load(readFileSync(path.join(process.cwd(),'dist\\'+constructionDoc)));
  const plansMerge = await PDFDocument.load(readFileSync(path.join(process.cwd(),'dist\\'+plans)));

  const pagesArray = await constructionDocMerge.copyPages(plansMerge, plansMerge.getPageIndices());

  for (const page of pagesArray) {
    constructionDocMerge.addPage(page);
  }
  //constructionDocMerge.addPage(pagesArray[1]);
  //constructionDocMerge.addPage(pagesArray[2]);

  writeFileSync(path.join(process.cwd(),'Construction Documents\\'+project.jobCode+" Construction Documents.pdf"), await constructionDocMerge.save());
}

exports.createConstructionDocs = createConstructionDocs;


async function mergeDocs(folderName,folder){
  try{
    const firstDoc = await PDFDocument.load(readFileSync(path.join(process.cwd(),folderName+'\\'+folder[0])));
    for(i=1;i<folder.length;i++){
      const docMerge = await PDFDocument.load(readFileSync(path.join(process.cwd(),folderName+'\\'+folder[i])));
      const pagesArray = await firstDoc.copyPages(docMerge, docMerge.getPageIndices());
      for (const page of pagesArray) {
        firstDoc.addPage(page);
      }
    }
    writeFileSync(path.join(process.cwd(),'Merged Construction Documents\\Merged '+folderName+'.pdf'), await firstDoc.save());
    /*if(folderName=='Construction Documents'){
      writeFileSync(path.join(process.cwd(),'Merged Construction Documents\\Merged Construction Documents.pdf'), await firstDoc.save());
    }
    if(folderName=='Folder Labels'){
      writeFileSync(path.join(process.cwd(),'Merged Construction Documents\\Merged Folder Labels.pdf'), await firstDoc.save());
    }*/
  }catch(err){
    console.log('merge doc function error')
    console.log(err)

  }
       
}
exports.mergeDocs = mergeDocs;

async function downloadDocs(req,res){
  let mergedDocsFolder = readdirSync(path.join(process.cwd(),'Merged Construction Documents'))
  let constructionDocumentsFolder = readdirSync(path.join(process.cwd(),'Construction Documents'))
  let labelFolder = readdirSync(path.join(process.cwd(),'Folder Labels'))
  
  if(req.params.id<=mergedDocsFolder.length){
    res.download(path.join(process.cwd(),'Merged Construction Documents\\'+mergedDocsFolder[req.params.id-1]))
    //res.download(`Merged Construction Documents/${mergedDocsFolder[req.params.id-1]}`) 
  }
  else if(req.params.id>mergedDocsFolder.length+constructionDocumentsFolder.length){
    res.download(path.join(process.cwd(),'Folder Labels\\'+labelFolder[req.params.id-mergedDocsFolder.length-1-constructionDocumentsFolder.length]))
  }
  else{
    res.download(path.join(process.cwd(),'Construction Documents\\'+constructionDocumentsFolder[req.params.id-mergedDocsFolder.length-1]))
  }
}
exports.downloadDocs = downloadDocs;