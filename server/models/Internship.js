import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  type: {
    type: String,
    default: 'Remote'
  },
  deadline: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Internship', internshipSchema);
