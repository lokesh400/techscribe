const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  minMembers: { type: Number, required: true },
  maxMembers: { type: Number, required: true },
  teamSize: { type: Number, required: true },
  prizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prize' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
});

module.exports = mongoose.model('Competition', competitionSchema);
