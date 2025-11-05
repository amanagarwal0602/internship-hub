import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  adminFeedback: {
    type: String,
    default: ''
  }
});

export default mongoose.model('Application', applicationSchema);
