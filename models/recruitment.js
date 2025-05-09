import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Add required field validation
  },
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Simple regex to validate email format
  },
  resume: {
    type: String,
    required: true, // The resume will store the file path as a string
  },
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Hired', 'Rejected'],
    default: 'Applied',
  },
  notes: String,
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const recruitmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String },
  description: { type: String },
  requirements: { type: String },
  salary: { type: String }, // Salary field (e.g., "$40k - $60k")
  position: { type: String }, // Position field (e.g., "Senior Developer")
  location: { type: String }, // Location field (e.g., "Remote" or city name)
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'], // Define the types of job
    default: 'Full-time', // Default job type
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
  applicants: [applicantSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recruitment = mongoose.model('Recruitment', recruitmentSchema);
export default Recruitment;