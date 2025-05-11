const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();

const {
  isLoggedIn,
  saveRedirectUrl,
  isAdmin,
  ensureAuthenticated,
} = require("../middlewares/login.js");

const Competition = require("../models/Competition");
const Prize = require("../models/Prize");
const Team = require("../models/Team");
const Participant = require("../models/Participant");

router.get("/competitions", async (req, res) => {
  try {
    const competitions = await Competition.find().populate("prizes");
    res.render("student/allCompetitions", { competitions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching competitions");
  }
});

// Display competition form
router.get("/competition/create", (req, res) => {
  res.render("student/createCompetition");
});

// Create new competition
router.post("/competition", async (req, res) => {
  const { title, description, minMembers, maxMembers, teamSize } = req.body;
  const competition = new Competition({
    title,
    description,
    minMembers,
    maxMembers,
    teamSize,
  });
  await competition.save();
  res.redirect(`/competition/${competition._id}`);
});

// Display competition details and prizes
router.get("/competition/:id", async (req, res) => {
  const competition = await Competition.findById(req.params.id).populate(
    "prizes"
  );
  res.render("student/competitionDetails", { competition });
});

// Add prize to competition
router.post("/competition/:id/prize", async (req, res) => {
  const { title, description, amount, type } = req.body;
  const prize = new Prize({
    competition: req.params.id,
    title,
    description,
    amount,
    type,
  });
  await prize.save();

  const competition = await Competition.findById(req.params.id);
  competition.prizes.push(prize);
  await competition.save();

  res.redirect(`/competition/${req.params.id}`);
});

// Apply to a team
router.get("/create/team/apply/:id", async (req, res) => {
  res.render("student/applyCompetition.ejs", { id: req.params.id });
});

router.post("/register/competition/team/:id", async (req, res) => {
  const {
    name,
    teamName,
    collegeName,
    teamSize,
    course,
    departement,
    email,
    phoneNumber,
  } = req.body;

  const team = await Team.findOne({ competition: req.params.id, teamName: teamName});
  if (team) {
    res.send("team name already take away");
  }

  const alreadyParticipant = await Participant.findOne({ competition: req.params.id,email:email });
  if (alreadyParticipant) {
    res.send("already registered for same this team");
  }
  const participant = new Participant({
    name,
    teamName,
    collegeName,
    course,
    departement,
    email,
    phoneNumber,
    competition: req.params.id,
    role: "Leader",
  });
  await participant.save();
  const leader = await Participant.findOne({ email:email, teamName:teamName });
  const leaderId = leader.id;
  const newTeam = new Team({
    competition: req.params.id,
    teamName,
    teamSize,
    leader: leaderId,
  });
  await newTeam.save();
});

// // Apply to a team
router.post('/search/already/team/apply/:id', async (req, res) => {
  const { teamName } = req.body;
//   const competition = await Competition.findById(req.params.id)
  const Name = teamName.toLowerCase();
  const team = await Team.findOne({teamName:Name,competition:req.params.id});

  console.log(team);

  // Ensure the student isn't already part of a team and the team is not full
//   if (team.members.length < team.competition.teamSize) {
//     team.applications.push(studentId);
//     await team.save();
//     res.redirect(`/competition/${team.competition._id}`);
//   } else {
//     res.send('Team is full or you are already part of a team');
//   }
});

module.exports = router;
