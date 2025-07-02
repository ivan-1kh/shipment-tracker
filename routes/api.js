import express from 'express';

import { createPackage, updatePackage, addLocationToPackage, getPackages } from './packages.js';
import { getCompanies, createCompany } from './companies.js';
import { getCustomers, createCustomer } from './customers.js';
import { searchLocation, getRoute } from './locations.js';


const router = express.Router();

// Routing for /packages
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.post('/packages/:id/location', addLocationToPackage);
router.get('/packages/:companyId', getPackages);

// Routing for /companies
router.get('/companies', getCompanies);
router.post('/companies', createCompany);

// Routing for /customers
router.get('/customers', getCustomers);
router.post('/customers', createCustomer);

// Routing for location utilities
router.get('/search-location', searchLocation);
router.get('/getroute/:pkgid', getRoute);


export default router;
