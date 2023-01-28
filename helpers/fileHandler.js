const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const fs = require('fs')
const extract = require('extract-zip')



const streamZipFileName = 'streamZipFile.zip'
const decompress = require('decompress');
const path = require('path')


const pdfParser = require('pdf-parse');
'use strict';

const request = require('superagent');

const { pipeline } = require("stream/promises");








async function clearDocs (folder,folderName){
  //let dist = fs.readdirSync(path.join(process.cwd(),'dist'))
  folder.forEach(element=>{
    //fs.unlinkSync(path.join(process.cwd(),'dist\\'+element))
    fs.unlinkSync(path.join(process.cwd(),folderName+'\\'+element))
  })
}

exports.clearDocs = clearDocs;



async function collection(unzippedDeliverables) {
  try{
    let collectedVariables = {}
    let deliverablesList = {}
    let plansList = await namePlans(unzippedDeliverables)
    let CDList = await nameCD(unzippedDeliverables)
    let BOMList = await nameBOM(unzippedDeliverables)
    let CELetterList = await nameCELetter(unzippedDeliverables)
    let strucCalc = await nameCalc(unzippedDeliverables)
    let EEStamped = await nameEEStamped(unzippedDeliverables)
    let EZPermit = await nameEZPermit(unzippedDeliverables)
    let expedited = await nameExpedited(unzippedDeliverables)

    deliverablesList['unstampedPlans'] = plansList[0]
    deliverablesList['stampedPlans'] = plansList[1]
    deliverablesList['CD'] = CDList
    deliverablesList['BOM'] = BOMList
    deliverablesList['CELetter'] = CELetterList[0]
    deliverablesList['certLetter'] = CELetterList[1]
    deliverablesList['EEStampedPlans'] = EEStamped
    deliverablesList['strucCalc'] = strucCalc
    deliverablesList['EZPermit'] = EZPermit
    deliverablesList['expedited'] = expedited

    //Go into another function----------------
    let cdVariablesItems = await extractPDFText(deliverablesList.CD)
    let plansVariablesItems = await extractPDFText(deliverablesList.unstampedPlans)
    let bomVariablesItems = await extractPDFText(deliverablesList.BOM)
  
  
    let cdVariablesList = await variablesFromCD(cdVariablesItems)
    let plansVariablesList = await variablesFromPlans(plansVariablesItems)
    let bomVariablesList = await variablesFromBOM(bomVariablesItems)
  

    collectedVariables['deliverablesList'] = deliverablesList
    collectedVariables['cdVariablesList'] = cdVariablesList
    collectedVariables['plansVariablesList'] = plansVariablesList
    collectedVariables['bomVariablesList'] = bomVariablesList

    

    return collectedVariables

  }catch(err){
    console.log(err)
  }
}
exports.collection = collection;


async function variablesFromBOM(pdfTextListBOM){
  try{
    dictOfBOMVariables = {}
    let Check711 = pdfTextListBOM.filter(el =>el.includes('711R-'))[0].split(' ')[0]
    //let Check712 = pdfTextListBOM.filter(el =>el.includes('712R-'))[0].split(' ')[0]
    if(Check711){
      dictOfBOMVariables['jobCode'] = Check711.trim()
    }else{
      dictOfBOMVariables['jobCode'] = pdfTextListBOM.filter(el =>el.includes('712R-'))[0].split(' ')[0].trim()
    }

    let disconnect = pdfTextListBOM.filter(el =>el.includes('DISCONNECT'))
    dictOfBOMVariables['disconnect'] = disconnect

    return dictOfBOMVariables
  }catch(err){

  }
}

exports.variablesFromBOM = variablesFromBOM;

async function variablesFromPlans(pdfTextListPlans){
  try{
    dictOfPlansVariables = {}
    try{
      let Check711 = pdfTextListPlans.filter(el =>el.includes('711R-'))[0]
      let Check712 = pdfTextListPlans.filter(el =>el.includes('712R-'))[0]
    }catch(err){
      let Check711 = ''
      let Check712 = ''
    }
    
    if(Check711){
      dictOfPlansVariables['jobCode'] = Check711.trim()
    }else{
      dictOfPlansVariables['jobCode'] = Check712.trim()
    }
    let rev = pdfTextListPlans.filter(el =>el.includes('REV:'))[0]
    dictOfPlansVariables['rev'] = rev.trim()

    let customerName = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el => el.toLowerCase().includes('fax'))[0])+1]//pdfTextList.filter(el => el.includes('CUSTOMER RESIDENCE'))
    dictOfPlansVariables['customerName'] = customerName


    let addressLine1 = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el => el.toLowerCase().includes('project number'))[0])-2]
    let addressLine2 = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el => el.toLowerCase().includes('project number'))[0])-1]
    let fullAddressList = addressLine1.concat(" ",addressLine2)
    let address = fullAddressList.split(',')[0]
    let city = fullAddressList.split(',')[1].trim()
    let state = fullAddressList.split(',')[2].trim()
    let zip = fullAddressList.split(',')[3].trim()
    let fullAddress = address.concat(", ",city,", ",state,", ",zip)

    dictOfPlansVariables['fullAddress'] = fullAddress
    dictOfPlansVariables['address'] = address
    dictOfPlansVariables['city'] = city
    dictOfPlansVariables['state'] = state
    dictOfPlansVariables['zip'] = zip


    //Get telephone
    let phone = pdfTextListPlans.filter(el =>el.toLowerCase().includes('tel.'))[0].split('. ')[1]

    dictOfPlansVariables['phone'] = phone

    //Get pin
    try{
      let pin = pdfTextListPlans.filter(el =>el.toLowerCase().includes('apn'))[0].split(':')[1].trim()

      dictOfPlansVariables['pin'] = pin
    }catch(err){
      dictOfPlansVariables['pin'] = ''
    }
    

    
    //Get System Size from plans *********** Not working ****************
    let findSystemSize = pdfTextListPlans.filter(el =>el.includes('SYSTEM SIZE:'))[0].split(':')[1].trim()
    if(findSystemSize){
      let systemSizeDC = Number(findSystemSize.split(',')[0].split('W')[0])
      let systemSizeAC = Number(findSystemSize.split(',')[1].trim().split('W')[0])
      dictOfPlansVariables['systemSizeDC'] = systemSizeDC
      dictOfPlansVariables['systemSizeAC'] = systemSizeAC
      dictOfPlansVariables['findSystemSize'] = findSystemSize
      //Get kW
      let kW = systemSizeDC/1000
      dictOfPlansVariables['kW'] = kW
    }



    //Get modules
    try{
      let findModules = pdfTextListPlans.filter(el =>el.includes('MODULES:'))[0].split('MODULES:')[1].split(')')[1].trim()
      let findModulesFull = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el =>el.includes('MODULES:'))[0])+1]
      let modules = findModules.concat(" ",findModulesFull)
      dictOfPlansVariables['modules'] = modules

      let numberOfModules = Number(pdfTextListPlans.filter(el =>el.includes('MODULES:'))[0].split('MODULES:')[1].split(')')[0].split('(')[1])
      dictOfPlansVariables['numberOfModules'] = numberOfModules
    }catch(err){
      dictOfPlansVariables['modules'] = ''
      dictOfPlansVariables['numberOfModules'] = ''
    }

    //'·INVERTER(S):'
    let inverter = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el =>el.includes('INVERTER(S):'))[0])+1]
    dictOfPlansVariables['inverter'] = inverter

    try{
      let racking = pdfTextListPlans.filter(el =>el.includes('RACKING:'))[0].split('RACKING:')[1].trim()
      dictOfPlansVariables['racking'] = racking
    }catch(err){
      dictOfPlansVariables['racking'] = ''
    }
    

    //Need code years!
    try{
      let irc = pdfTextListPlans.filter(el =>el.includes('ALL WORK SHALL COMPLY WITH '))[0].split('ALL WORK SHALL COMPLY WITH ')[1].split(' ')[0]
      dictOfPlansVariables['irc'] = irc


      let nec = pdfTextListPlans.filter(el =>el.includes('PHOTOVOLTAIC SYSTEM WILL COMPLY WITH '))[0].split('PHOTOVOLTAIC SYSTEM WILL COMPLY WITH ')[1]
      dictOfPlansVariables['nec'] = nec
    }catch(err){
      dictOfPlansVariables['irc'] = ''
      dictOfPlansVariables['nec'] = ''
    }
    //Get Number of Arrays
    let ArraysList = pdfTextListPlans.filter(el =>el.toLowerCase().includes('array ar-0'))
    let numberOfArraysList = ArraysList[ArraysList.length-1].split('').filter(el=>!isNaN(el))
    let numberOfArrays = Number(numberOfArraysList[numberOfArraysList.length-1])
    dictOfPlansVariables['numberOfArrays'] = numberOfArrays

    //Roof and panel Area
    try{
      let  roofArea = Number(pdfTextListPlans.filter(el =>el.includes('TOTAL ROOF SURFACE AREA'))[0].split('TOTAL ROOF SURFACE AREA: ')[1].split(' ')[0])
      dictOfPlansVariables['roofArea'] = roofArea
      let  arrayArea = Number(pdfTextListPlans.filter(el =>el.includes('ARRAY AREA'))[0].split('TOTAL PV ARRAY AREA: ')[1].split(' ')[0])
      dictOfPlansVariables['arrayArea'] = arrayArea
      let percentageCoverage = (arrayArea/roofArea)*100
      dictOfPlansVariables['percentageCoverage'] = percentageCoverage
    }catch(err){
      dictOfPlansVariables['roofArea'] = ''
      dictOfPlansVariables['arrayArea'] = ''
      dictOfPlansVariables['percentageCoverage'] = ''
    }
    
  




    let  numberOfStoriesList = pdfTextListPlans.filter(el =>el.includes('-Story'))
    dictOfPlansVariables['numberOfStories'] = numberOfStoriesList[numberOfStoriesList.length-1]

    let findRafter = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el =>el.includes('-Story'))[0])+1]
    dictOfPlansVariables['findRafter'] = findRafter

    let spacing = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el =>el.includes('-Story'))[0])+2]
    dictOfPlansVariables['spacing'] = spacing
    try{
      snowLoad = pdfTextListPlans.filter(el =>el.includes('SNOW LOAD: '))[0].split('SNOW LOAD: ')[1]
      dictOfPlansVariables['snowLoad'] = snowLoad
    }catch(err){
      dictOfPlansVariables['snowLoad'] = ''
    }
    

    let  windSpeed = pdfTextListPlans[pdfTextListPlans.indexOf(pdfTextListPlans.filter(el =>el.includes('WIND SPEED'))[0])+1]
    dictOfPlansVariables['windSpeed'] = windSpeed

    return dictOfPlansVariables
  }catch(err){
    console.log(err)
  }
}

exports.variablesFromPlans = variablesFromPlans;

async function variablesFromCD(pdfTextListCD){
  try{
    //Get job code

    dictOfCDVariables = {}
    let Check711 = pdfTextListCD.filter(el =>el.includes('711R-'))[0]
    let Check712 = pdfTextListCD.filter(el =>el.includes('712R-'))[0]
    if(Check711){
      dictOfCDVariables['jobCode'] = Check711.trim()
    }else{
      dictOfCDVariables['jobCode'] = Check712.trim()
    }
  }catch(err){
    dictOfCDVariables['jobCode'] = ''
  }
  try{
    //Get customer name from fax 0
    let customerName = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('fax'))[0])+1]//pdfTextList.filter(el => el.includes('CUSTOMER RESIDENCE'))
    dictOfCDVariables['customerName'] = customerName

  }catch(err){
    dictOfCDVariables['customerName'] = ''
  }
  
    
  
  
  try{
    //Get address
    let addressLine1 = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('project number'))[0])-2]
    let addressLine2 = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('project number'))[0])-1]
    let fullAddressList = addressLine1.concat(" ",addressLine2)
    let address = fullAddressList.split(',')[0]
    let city = fullAddressList.split(',')[1].trim()
    let state = fullAddressList.split(',')[2].trim()
    let zip = fullAddressList.split(',')[3].trim()
    let fullAddress = address.concat(", ",city,", ",state,", ",zip)

    dictOfCDVariables['fullAddress'] = fullAddress
    dictOfCDVariables['address'] = address
    dictOfCDVariables['city'] = city
    dictOfCDVariables['state'] = state
    dictOfCDVariables['zip'] = zip
  }catch(err){
    dictOfCDVariables['fullAddress'] = ''
    dictOfCDVariables['address'] = ''
    dictOfCDVariables['city'] = ''
    dictOfCDVariables['state'] = ''
    dictOfCDVariables['zip'] = ''
  }
  try{
    //Get telephone
    let phone = pdfTextListCD.filter(el =>el.toLowerCase().includes('tel.'))[0].split('. ')[1]

    dictOfCDVariables['phone'] = phone

  }catch(err){
    dictOfCDVariables['phone'] =''
  }
  try{
    //Get pin
    let pin = pdfTextListCD.filter(el =>el.toLowerCase().includes('apn'))[0].split(':')[1].trim()

    dictOfCDVariables['pin'] = pin
  }catch(err){
    dictOfCDVariables['pin'] =''
  }
  

  try{
    //Get System Size
    let findSystemSize = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('system size'))[0])+1]
    let systemSizeDC = Number(findSystemSize.split(',')[0].split('W')[0])
    let systemSizeAC = Number(findSystemSize.split(',')[1].trim().split('W')[0])
    dictOfCDVariables['systemSizeDC'] = systemSizeDC
    dictOfCDVariables['systemSizeAC'] = systemSizeAC


    //Get kW
    let kW = systemSizeDC/1000
    dictOfCDVariables['kW'] = kW
  }catch(err){
    dictOfCDVariables['systemSizeDC'] = ''
    dictOfCDVariables['systemSizeAC'] = ''
    dictOfCDVariables['kW'] = ''
  }

try{
  //Get modules
  let Checkhanwha = pdfTextListCD.filter(el =>el.toLowerCase().includes('hanwha'))
  let Checklongi = pdfTextListCD.filter(el =>el.toLowerCase().includes('longi'))
  if(Checkhanwha){
    dictOfCDVariables['modules'] = Checkhanwha[Checkhanwha.length-1].split('MODULES')[1].split(')')[1].trim()
    dictOfCDVariables['numberOfModules'] = Number(Checkhanwha[Checkhanwha.length-1].split('MODULES')[1].split(')')[0].split('(')[1])
  }else if(Checklongi){
    dictOfCDVariables['modules'] = CheckLlongi[Checkhanwha.length-1].split('MODULES')[1].split(')')[1].trim()
    dictOfCDVariables['numberOfModules'] = Number(Checklongi[Checkhanwha.length-1].split('MODULES')[1].split(')')[0].split('(')[1])
  }
}catch(err){
  dictOfCDVariables['modules'] = ''
  dictOfCDVariables['numberOfModules'] = ''
}
  
try{
  //Get Number of Arrays
  let ArraysList = pdfTextListCD.filter(el =>el.toLowerCase().includes('array ar-0'))
  let numberOfArraysList = ArraysList[ArraysList.length-1].split('').filter(el=>!isNaN(el))
  let numberOfArrays = Number(numberOfArraysList[numberOfArraysList.length-1])
  dictOfCDVariables['numberOfArrays'] = numberOfArrays
  
}catch(err){
  dictOfCDVariables['numberOfArrays'] = ''
}
  
try{
  //Get Frame Type
  let frameType = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('frame type'))[0])+1]
  dictOfCDVariables['frameType'] = frameType
  
  let sizeOfRafter = frameType.split(' ')[0]
  dictOfCDVariables['sizeOfRafter'] = sizeOfRafter

  let numberOfStories = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('max roof height'))[0])].split('MAX ROOF HEIGHT')[1].split(' ')[0]
  dictOfCDVariables['numberOfStories'] = numberOfStories

  let spacing = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('max roof height'))[0])].split('SPACING')[1].split(' ')[0]
  dictOfCDVariables['spacing'] = spacing

}catch(err){
  dictOfCDVariables['frameType'] = ''
  dictOfCDVariables['sizeOfRafter'] = ''
  dictOfCDVariables['numberOfStories'] = ''
  dictOfCDVariables['spacing'] = ''
}

try{
  //Electrical Scope of Work
  let mainPanelUpgrade = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('main panel upgrade'))[0])+1]
  dictOfCDVariables['mainPanelUpgrade'] = mainPanelUpgrade
}catch(err){
  dictOfCDVariables['mainPanelUpgrade'] = ''
}

try{
  let mainPanelReplacement = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('main panel replacement'))[0])+1]
  dictOfCDVariables['mainPanelReplacement'] = mainPanelReplacement
}catch(err){
  dictOfCDVariables['mainPanelReplacement'] = ''
}

try{
  let meterAdapter = pdfTextListCD.filter(el =>el.toLowerCase().includes('meter adapter'))[0].split('METER ADAPTER')[1]
  dictOfCDVariables['meterAdapter'] = meterAdapter
}catch(err){
  dictOfCDVariables['meterAdapter'] = ''
}

try{
  let serviceRefeed = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('service refeed'))[0])+1]
  dictOfCDVariables['serviceRefeed'] = serviceRefeed
}catch(err){
  dictOfCDVariables['serviceRefeed'] = ''
}

try{
  let subPanel = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('new sub-panel'))[0])+1]
  dictOfCDVariables['subPanel'] = subPanel
}catch(err){
  dictOfCDVariables['subPanel'] = ''
}

try{
  let interconnection = pdfTextListCD.filter(el =>el.includes('INTERCONNECTION'))[0].split('INTERCONNECTION')[1]
  if(interconnection ==""){
    dictOfCDVariables['interconnection'] = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.includes('INTERCONNECTION'))[0])+1]
  }else{
    dictOfCDVariables['interconnection'] = interconnection
  }
}catch(err){
  dictOfCDVariables['interconnection'] = ''
}  

try{
  let ahj = pdfTextListCD.filter(el =>el.toLowerCase().includes('jurisdiction'))[0].split('JURISDICTION')[1].trim()
  if(ahj ==''){
    let ahjNext = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el =>el.toLowerCase().includes('jurisdiction'))[0])+1]
    dictOfCDVariables['ahj'] = ahjNext.trim()
  }else{
    dictOfCDVariables['ahj'] = ahj
  }
}catch(err){
  dictOfCDVariables['ahj'] = ''
}

try{
  let utility = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('jurisdiction'))[0])+2].split('BRANCH')[0].trim()
  dictOfCDVariables['utility'] = utility
}catch(err){
  dictOfCDVariables['utility'] = ''
}
  
try{
  let branch = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('jurisdiction'))[0])+3]
  dictOfCDVariables['branch'] = branch
}catch(err){
  dictOfCDVariables['branch'] = ''
}
 
try{

}catch(err){

}


try{
  let inverter1 = pdfTextListCD.filter(el =>el.toLowerCase().includes('inverter(s)'))[0].split('INVERTER(S)')[1].split(')')[1].trim()
  let inverter2 = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('inverter(s)'))[0])+1]
  let inverter3 = pdfTextListCD[pdfTextListCD.indexOf(pdfTextListCD.filter(el => el.toLowerCase().includes('inverter(s)'))[0])+2]
  let inverters = [inverter1, inverter2, inverter3].filter(el=>!el.includes('when applicable'))

  dictOfCDVariables['inverters'] = inverters
}catch(err){
  dictOfCDVariables['inverters'] = ''
}
  
try{
  let energyStorage = pdfTextListCD.filter(el =>el.toLowerCase().includes('energy storage'))[0].split('ENERGY STORAGE')[1]

  dictOfCDVariables['energyStorage'] = energyStorage
}catch(err){
  dictOfCDVariables['energyStorage'] = ''
}
  

  return dictOfCDVariables
}

exports.variablesFromCD = variablesFromCD;


async function extractPDFText(pdf){
  try{
    let dataBuffer = fs.readFileSync(path.join(process.cwd(),'dist\\'+pdf));
    let data = await pdfParser(dataBuffer)
    let pdfTextList = data.text.split('\n')
    return pdfTextList

  }catch(err){
    console.log(err)
}
}

exports.extractPDFText = extractPDFText;








async function nameExpedited(unzippedDeliverables){
  try{
    let Expedited = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('expedited'))[0]
  
    return Expedited 
    
  }catch(err){
    console.log(err)
}
}

exports.nameExpedited = nameExpedited;


async function nameEZPermit(unzippedDeliverables){
  try{
    let easyPermitList = []
    let EZPermit = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('ez'))[0]
    let easyPermit = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('easy'))[0]
    if(EZPermit){
      easyPermitList.push(EZPermit)
    }
    if(easyPermit){
      easyPermitList.push(easyPermit)
    }
    return easyPermitList[0]
    
  }catch(err){
    console.log(err)
}
}

exports.nameEZPermit = nameEZPermit;

async function nameLayout(unzippedDeliverables){
  try{
    let layout = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('layout'))[0]
  
    return layout
    
  }catch(err){
    console.log(err)
}
}

exports.nameLayout = nameLayout;

async function nameEEStamped (unzippedDeliverables){
  try{
    let EEStamped = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('ee'))[0]
    return EEStamped
    
  }catch(err){
    console.log(err)
}
}

exports.nameEEStamped = nameEEStamped;


async function nameCalc (unzippedDeliverables){
  try{
    let strucCalc = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('calc'))[0]

    return strucCalc
    
  }catch(err){
    console.log(err)
}
}

exports.nameCalc = nameCalc;

async function nameCELetter (unzippedDeliverables){
  try{
    let CELetter = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('celetter'))[0]
    let certLetter = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('cert'))[0]
    return [CELetter, certLetter]
    
  }catch(err){
    console.log(err)
}
}

exports.nameCELetter = nameCELetter;



async function nameBOM (unzippedDeliverables){
  try{
    let BOM = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('bom')).filter(el=>el.toLowerCase().includes('.pdf'))[0]

    return BOM
  }catch(err){
    console.log(err)
}
}

exports.nameBOM = nameBOM;


async function nameCD (unzippedDeliverables){
  try{
    let CD = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('cd'))[0]


    return CD
  }catch(err){
    console.log(err)
}
}

exports.nameCD = nameCD;



async function namePlans (unzippedDeliverables){
  try{
    let unstampedPlans = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('plans'))[0]
    let stampedPlans = await unzippedDeliverables.filter(el=>el.toLowerCase().includes('plans')).filter(el=>el.toLowerCase().includes('stamp'))[0]
    return [unstampedPlans,stampedPlans]
  }catch(err){
    console.log(err)
}
}

exports.namePlans = namePlans;

async function unzip(remoteZipFileUrl) {

  await pipeline(
    request.get(remoteZipFileUrl),
    fs.createWriteStream(streamZipFileName)
  );

  await decompress(streamZipFileName, 'dist');

  let preUnzippedDeliverables = fs.readdirSync(path.join(process.cwd(),'dist'))
  preUnzippedDeliverables.forEach((el)=>{
      if(fs.statSync(path.join(process.cwd(),'dist\\'+el)).isDirectory()){
      let innerFolder = fs.readdirSync(path.join(process.cwd(),'dist\\'+el))
      innerFolder.forEach((innerEl)=>{
        if(!fs.statSync(path.join(process.cwd(),'dist\\'+el+'\\'+innerEl)).isDirectory()){
          fs.copyFileSync(path.join(process.cwd(),'dist\\'+el+'\\'+innerEl), path.join(process.cwd(),'dist\\'+innerEl))
        }
      })
      fs.rmSync(path.join(process.cwd(),'dist\\'+el), { recursive: true, force: true });
    }
  })
  let doubleFolderCheck = fs.readdirSync(path.join(process.cwd(),'dist'))
  doubleFolderCheck.forEach((el) =>{
    if(fs.statSync(path.join(process.cwd(),'dist\\'+el)).isDirectory()){
      let innerFolder = fs.readdirSync(path.join(process.cwd(),'dist\\'+el))
      innerFolder.forEach((innerEl)=>{
        fs.copyFileSync(path.join(process.cwd(),'dist\\'+el+'\\'+innerEl), path.join(process.cwd(),'dist\\'+innerEl))
    
      })
      fs.rmSync(path.join(process.cwd(),'dist\\'+el), { recursive: true, force: true });
    }
  })
}

exports.unzip = unzip;
