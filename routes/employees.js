import express from 'express';
import { Employee } from '../models/Employee.js';
import { io } from '../server.js'; // Import io from the server file

const router = express.Router();

// @desc    Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching employees' });
  }
});

// @desc    Add a new employee
router.post('/', async (req, res) => {
  const { name, client, startDate, promotionDate, position } = req.body;

  if (!name || !client || !startDate || !position) {
    return res.status(400).json({ message: 'Name, client, start date, and position are required.' });
  }

  try {
    const newEmployee = new Employee({
      name,
      client,
      startDate,
      promotionDate,
      position, // Using 'position' instead of 'designation'
    });

    const savedEmployee = await newEmployee.save();

    // Emit a notification to all connected clients when a new employee is added
    io.emit('notification', `New employee added: ${newEmployee.name}`);

    res.status(201).json(savedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving employee' });
  }
});

// ✅ Add a note to an employee
router.post('/:id/notes', async (req, res) => {
  const { content, date } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Note content is required.' });
  }

  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.notes.push({
      content,
      date: date || new Date(),
    });

    const updatedEmployee = await employee.save();
    
    // Emit notification when a note is added
    io.emit('notification', `Note added to employee: ${employee.name}`);

    res.status(200).json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding note to employee' });
  }
});

// ✅ UPDATED: Update employee performance rating (validated)
router.put('/:id/rating', async (req, res) => {
  const { id } = req.params;
  const { performanceRating } = req.body;

  if (typeof performanceRating !== 'number' || performanceRating < 0 || performanceRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 0 and 5.' });
  }

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { performanceRating },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Emit notification when performance rating is updated
    io.emit('notification', `Performance rating updated for: ${updatedEmployee.name}`);

    res.status(200).json({
      message: 'Performance rating updated successfully.',
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update rating.' });
  }
});

// @desc    Delete an employee by ID
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.deleteOne();

    // Emit notification when employee is deleted
    io.emit('notification', `Employee deleted: ${employee.name}`);

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

export default router;