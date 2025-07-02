import mongoose from 'mongoose';

const customersSchema = new mongoose.Schema({

  customer_name: {
    type: String,
    required: true,
    trim: true
  },

  customer_email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },

  customer_address: {
    type: String,
    required: true,
    trim: true
  }
  
}, {
  timestamps: true
});

export default mongoose.model('Customers', customersSchema);