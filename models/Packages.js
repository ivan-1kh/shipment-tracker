import mongoose from 'mongoose';

// Sub-schema for location coordinates
const locationsSchema = new mongoose.Schema({

  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },

  lon: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

}, { _id: false }); //disables _id for subdocuments


const packagesSchema = new mongoose.Schema({

  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  package_name: {
    type: String,
    required: true,
    trim: true
  },

  creation_date: {
    type: Date,
    default: Date.now
  },

  eta: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    required: true,
    enum: ['packed', 'shipped', 'intransit', 'delivered'],
    default: 'pending'
  },

  path: [locationsSchema], // Array of location objects

  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies',
    required: true
  },

  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers',
    required: true
  }
  
}, {
  timestamps: true
});

export default mongoose.model('Packages', packagesSchema);