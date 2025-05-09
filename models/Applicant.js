// models/Applicant.js
import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruitment', // Reference to Recruitment model
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  currentSalary: {
    type: Number,
    required: false,
  },
  expectedSalary: {
    type: Number,
    required: false,
  },
  portfolioLink: {
    type: String,
    required: false, // Optional field for portfolio link
  },
  linkedinProfile: {
    type: String,
    required: false, // Optional field for LinkedIn profile URL
  },
  resume: {
    type: String,
    required: true, // This is a required field for the resume
  },
}, { timestamps: true });

export default mongoose.model('Applicant', applicantSchema);