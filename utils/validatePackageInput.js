import validator from 'validator';

import Companies from '../models/Companies.js';
import Customers from '../models/Customers.js';
import Packages from '../models/Packages.js';


/**
 * Validate package input data
 */
export default async function validatePackageInput(data) {
  const errors = [];


  // const { sku, package_name, eta, status, company_id, customer_id } = req.body;

  if (!data.sku || !validator.isLength(data.sku.trim(), { min: 1, max: 50 })) {
    errors.push('SKU is required and must be between 1-50 characters');
  }

  if (!data.package_name || !validator.isLength(data.package_name.trim(), { min: 1, max: 200 })) {
    errors.push('Package name is required and must be between 1-200 characters');
  }

  if (!validator.isISO8601(data.eta.trim())) {
    errors.push('Package ETA must be a date');
  }

  if (!data.status || (!['packed', 'shipped', 'intransit', 'delivered'].includes(data.status.trim()))) {
    errors.push('Package status is required and must be one of the following: [packed, shipped, intransit, delivered]');
  }

  if (!data.company_id || !validator.isMongoId(data.company_id)) {
    errors.push('Company ID is invalid');
  }

  if (!data.customer_id || !validator.isMongoId(data.customer_id)) {
    errors.push('Customer ID is invalid');
  }
  
  // Check if company exists
  const company = await Companies.findById(data.company_id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  // Check if customer exists
  const customer = await Customers.findById(data.customer_id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return errors;
}