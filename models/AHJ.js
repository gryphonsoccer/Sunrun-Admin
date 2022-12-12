const mongoose = require("mongoose");

const AhjSchema = new mongoose.Schema({
  ahjName: {
    type: String,
    required: true,
  },
  ahjCode: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    require: true,
    default: 'IL',
  },
  govType: {
    type: String,
    require: true,
    default: 'VILLAGE',
  },
  nec: {
    type: Number,
  },
  copies: {
    type: Number,
    default: 3,
  },
  /*user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },*/
  deliverables: {
    type: Boolean,
    default: true,
  },
  contractPage: {
    type: Boolean,
    default: false,
  },
  costBreakdown: {
    type: Boolean,
    default: false,
  },
  eeStamps: {
    type: Boolean,
    default: false,
  },
  electricalLicence: {
    type: Boolean,
    default: false,
  },
  icc: {
    type: Boolean,
    default: false,
  },
  roofLicense: {
    type: Boolean,
    default: false,
  },
  pics: {
    type: Boolean,
    default: false,
  },
  interconnection: {
    type: Boolean,
    default: false,
  },
  hoa: {
    type: Boolean,
    default: false,
  },
  customerSignature: {
    type: Boolean,
    default: false,
  },
  platSurvey: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  zip: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  url: {
    type: String,
  },
  inspectionNotes: {
    type: String,
  },
});

module.exports = mongoose.model("Ahj", AhjSchema);
