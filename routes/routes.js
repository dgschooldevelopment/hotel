const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
const { userLogin, userSignUp } = require('../controllers/userlogin');
const { adminLogin } = require('../controllers/adminlogin');
const { villaRegister, villaLogin } = require('../controllers/villalogin');
const { hotelList } = require('../controllers/hotellist');
const { Inserthotel_List } = require('../controllers/Inserthotellist');
//const { fetchNearbyHotels } = require('../controllers/Searchhotel'); // Adjust path as per your project structure
const { bookHotel } = require('../controllers/bookhotel');
const { fetchHotelDetails } = require('../controllers/fetchHotelDetails'); // Adjust path as per your project structure
const { searchHotels } = require('../controllers/checkhotel');
const { Insertreviews } = require('../controllers/insertreviews'); // Import searchHotels function
// User routes
router.post('/userlogin', userLogin);
router.post('/usersignUp', userSignUp);

// Admin routes
router.post('/adminlogin', adminLogin);

// Villa routes
router.post('/villaregister', villaRegister);
router.post('/villalogin', villaLogin);

// Hotel routes
router.get('/hotellist', hotelList);
router.post('/hotel_insert', Inserthotel_List);
//router.get('/nearbyhotels', fetchNearbyHotels);
router.post('/book-hotel', bookHotel);
router.get('/searchhotels', searchHotels); 
router.get('/fetchHotelDetails', fetchHotelDetails); 
router.get('/fetchHotelDetails', fetchHotelDetails); 
router.post('/Insertreviews', Insertreviews); 
module.exports = router;
