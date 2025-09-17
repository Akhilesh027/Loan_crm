// Create a schema and model
const mongoose = require('mongoose');

const fieldDataSchema = new mongoose.Schema({
  bankName: String,
  bankArea: String,
  managerName: String,
  managerPhone: String,
  managerType: String, // Added manager type field
  executiveCode: String,
  collectionData: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FieldData", fieldDataSchema);