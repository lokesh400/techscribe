const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
  name:String,
  email:String,
  collegeName:String,
  departement:String,
  course:String,
  teamName:String,
  phoneNumber:String,
  role:String
});

module.exports = mongoose.model('Participant', participantSchema);
