
const { hotelPool } = require('../config/dbconfig');
const { geocodeAddress } = require('../middleware/geocodeAddress'); // Adjust path as per your project structure
const bcrypt = require('bcryptjs');
const userSignUp = async (req, res) => {
    const { emailid, password, confirm_password, name, mobileno, location } = req.body;

    // Check if all required fields are provided
    if (!emailid || !password || !confirm_password || !name || !mobileno || !location) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Password and confirm password do not match' });
    }

    try {
        // Check if user already exists
        const userExistsQuery = `SELECT * FROM user WHERE emailid = ?`;
        const [existingUsers] = await hotelPool.query(userExistsQuery, [emailid]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Geocode location to get latitude and longitude
        const { latitude, longitude } = await geocodeAddress(location);

        // Insert the user into the database
        const insertUserQuery = `
            INSERT INTO user (emailid, password, name, mobileno, location, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [insertResult] = await hotelPool.query(insertUserQuery, [emailid, hashedPassword, name, mobileno, location, latitude, longitude]);

        if (insertResult.affectedRows === 1) {
            return res.status(201).json({ success: true, message: 'User created successfully' });
        } else {
            throw new Error('Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.message === 'No results found') {
            return res.status(400).json({ error: 'Invalid location' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};




const jwt = require('jsonwebtoken');


const userLogin = async (req, res) => {
    const { emailid, password } = req.body;

    if (!emailid || !password) {
        return res.status(400).json({ error: 'Email and password are required parameters' });
    }

    try {
        const userQuery = `SELECT * FROM user WHERE emailid = ?`;
        const [userDetails] = await hotelPool.query(userQuery, [emailid]);

        if (userDetails.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userDetails[0];
        const hashedPassword = user.password; // Assuming your password column is named 'password'

        // Compare hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Passwords match, generate JWT token
        const token = jwt.sign(
            { userid: user.userid, emailid: user.emailid },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        return res.status(200).json({ success: true, message: 'Successfully logged in', token, user });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    userLogin,
    userSignUp
};
