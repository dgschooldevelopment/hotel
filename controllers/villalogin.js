const { hotelPool } = require("../config/dbconfig");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { geocodeAddress } = require('../middleware/geocodeAddress'); // Adjust path as per your project structure


const villaRegister = async (req, res) => {
    const { villa_username, password, location } = req.body;

    if (!villa_username || !password || !location) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if villa already exists
        const villaExistsQuery = `SELECT * FROM villa WHERE villa_username = ?`;
        const [existingVillas] = await hotelPool.query(villaExistsQuery, [villa_username]);

        if (existingVillas.length > 0) {
            return res.status(400).json({ error: 'Villa already exists' });
        }

        // Hash the password
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Geocode location to get latitude and longitude
        const { latitude, longitude } = await geocodeAddress(location);

        // Insert the villa into the database
        const insertVillaQuery = `
            INSERT INTO villa (villa_username, password, location, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [insertResult] = await hotelPool.query(insertVillaQuery, [villa_username, hashedPassword, location, latitude, longitude]);

        if (insertResult.affectedRows === 1) {
            return res.status(201).json({ success: true, message: 'Villa registered successfully' });
        } else {
            throw new Error('Failed to register villa');
        }
    } catch (error) {
        console.error('Error registering villa:', error);
        if (error.message === 'No results found') {
            return res.status(400).json({ error: 'Invalid location' });
        }
        return res.status(500).json({ error: 'Internal server error' });
  
    }
};

const villaLogin = async (req, res) => {
    const { villa_username, password } = req.body;

    if (!villa_username || !password) {
        return res.status(400).json({ error: 'Villa username and password are required parameters' });
    }

    try {
        // Check if villa exists
        const villaQuery = `SELECT * FROM villa WHERE villa_username = ?`;
        const [villaDetails] = await hotelPool.query(villaQuery, [villa_username]);

        if (villaDetails.length === 0) {
            return res.status(404).json({ error: 'Villa not found' });
        }

        const villa = villaDetails[0];
        const hashedPassword = villa.password;

        // Compare hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Passwords match, generate JWT token
        const token = jwt.sign(
            { villa_id: villa.villa_id, villa_username: villa.villa_username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        return res.status(200).json({
            success: true,
            message: 'Successfully logged in',
            token: token,
            villa: {
                villa_id: villa.villa_id,
                villa_username: villa.villa_username,
                location: villa.location
            }
        });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    villaLogin,
    villaRegister
};