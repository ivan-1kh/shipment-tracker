import mongoose from 'mongoose';

const companiesSchema = new mongoose.Schema({

  company_name: {
    type: String,
    required: true,
    trim: true
  },
  
  company_website: {
    type: String,
    required: true,
    trim: true
  }

}, {
  timestamps: true //automatically adds timestamp fields
});

export default mongoose.model('Companies', companiesSchema);