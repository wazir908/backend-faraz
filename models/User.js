import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,  // Only if you're using it, make it optional
    unique: true, // Ensure username is unique if used
    default: 'guest'  // Optionally set a default value if necessary
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

export default User;