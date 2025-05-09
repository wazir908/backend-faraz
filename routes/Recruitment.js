import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Recruitment from '../models/recruitment.js';
import Applicant from '../models/Applicant.js';

const router = express.Router();

// Enable CORS for security and cross-origin resource sharing
router.use(cors());

// Serve uploaded resumes statically
router.use('/uploads', express.static(path.join('uploads')));

// Set up Multer for file uploads
// Configure storage settings for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); // Ensure uploads folder exists
    cb(null, dir); // Set the upload destination
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get file extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`; // Create a unique file name
    cb(null, uniqueName); // Use unique file name to avoid conflicts
  },
});

// File upload restrictions: only allow PDFs and Word files, with a maximum size of 10MB
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF and Word files are allowed.'));
    }
    cb(null, true); // Allow the file upload
  },
});

/**
 * @desc Get all job postings
 * @route GET /api/recruitments
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Fetch jobs sorted by creation date
    const jobs = await Recruitment.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error('❌ Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * @desc Create a new job posting
 * @route POST /api/recruitments
 * @access Admin
 */
router.post('/', async (req, res) => {
  try {
    const newJob = new Recruitment(req.body);
    await newJob.save(); // Save the new job posting to the database
    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (err) {
    console.error('❌ Job creation error:', err);
    res.status(500).json({ error: 'Failed to create job', details: err.message });
  }
});

/**
 * @desc Get a single job by ID
 * @route GET /api/recruitments/:id
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Recruitment.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.status(200).json(job); // Return the found job
  } catch (err) {
    console.error('❌ Error fetching job:', err);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

/**
 * @desc Delete a job by ID
 * @route DELETE /api/recruitments/:id
 * @access Admin
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedJob = await Recruitment.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ error: 'Job not found' });
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting job:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

/**
 * @desc Submit an applicant to a job
 * @route POST /api/recruitments/:jobId/applicants
 * @access Public
 */
router.post('/:jobId/applicants', upload.single('resume'), async (req, res) => {
  try {
    // Log the incoming data to see what is being sent in the request
    console.log('Request Body:', req.body); // Log all fields sent in the request
    console.log('File:', req.file); // Log the uploaded file to check if it's received properly

    const {
      name,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
      experience,
      portfolioLink,
      linkedinProfile
    } = req.body; // Destructure form fields

    const jobId = req.params.jobId;
    const resumePath = req.file?.path; // Get the resume path

    // Check if resume file is provided
    if (!resumePath) return res.status(400).json({ error: 'Resume file is required' });

    // Check if essential fields are provided
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required fields' });
    }

    // Create a new applicant object
    const newApplicant = new Applicant({
      name,
      email,
      phone,
      resume: resumePath,
      jobId,
      currentSalary,
      expectedSalary,
      portfolioLink, // Add portfolioLink field
      linkedinProfile // Add linkedinProfile field
    });

    // Save the new applicant to the database
    await newApplicant.save();

    // Return a success response
    res.status(201).json({ message: 'Applicant submitted successfully', applicant: newApplicant });
  } catch (err) {
    console.error('❌ Error submitting applicant:', err);
    res.status(500).json({ error: 'Failed to submit applicant' });
  }
});
/**
 * @desc Get applicants for a job
 * @route GET /api/recruitments/:jobId/applicants
 * @access Public
 */
router.get('/:jobId/applicants', async (req, res) => {
  try {
    const applicants = await Applicant.find({ jobId: req.params.jobId });
    const formattedApplicants = applicants.map(applicant => ({
      ...applicant._doc,
      resume: `${process.env.BASE_URL || 'http://localhost:5000'}/${applicant.resume.replace(/\\/g, '/')}`,
    }));

    res.status(200).json(formattedApplicants); // Send the list of applicants with resume URLs
  } catch (err) {
    console.error('❌ Error fetching applicants:', err);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

export default router;