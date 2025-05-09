import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: { // Changed from 'designation' to 'position'
    type: String,
    required: true, // You can set it to false if position is optional
  },
  client: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  promotionDate: {
    type: Date,
  },
  performanceRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  notes: [noteSchema],
}, {
  timestamps: true, // Will automatically manage 'createdAt' and 'updatedAt' fields
});

export const Employee = mongoose.model('Employee', employeeSchema);