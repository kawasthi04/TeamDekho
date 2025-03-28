require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define Mongoose Schemas & Models
const studentSchema = new mongoose.Schema({
  Name: String,
  Cluster: String,
  Branch: String,
  Contact: String,
  Timestamp: { type: Date, default: Date.now }
});

const vacancySchema = new mongoose.Schema({
  TeamName: String,
  Description: String,
  Contact: String,
  Timestamp: { type: Date, default: Date.now }
});

const AvailableStudents = mongoose.model("AvailableStudents", studentSchema);
const TeamVacancies = mongoose.model("TeamVacancies", vacancySchema);

// **Routes**

// Fetch all students
app.get('/api/candidates', async (req, res) => {
  try {
    const students = await AvailableStudents.find().sort({ Timestamp: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// Add a new candidate
app.post('/api/candidates', async (req, res) => {
    try {
      console.log("Received candidate data:", req.body);
      const newCandidate = new AvailableStudents(req.body);
      await newCandidate.save();
      res.status(201).json({ message: "Candidate added successfully!" });
    } catch (err) {
      console.error("Error in POST /api/candidates:", err);
      res.status(500).json({ error: "Failed to add candidate" });
    }
});
  

// Fetch all vacancies
app.get('/api/vacancies', async (req, res) => {
  try {
    const vacancies = await TeamVacancies.find().sort({ Timestamp: -1 });
    res.json(vacancies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vacancies" });
  }
});

// Add a new vacancy
app.post('/api/vacancies', async (req, res) => {
  try {
    const newVacancy = new TeamVacancies(req.body);
    await newVacancy.save();
    res.status(201).json({ message: "Vacancy added successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add vacancy" });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
