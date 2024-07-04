const jwt = require('jsonwebtoken');
const { hotelPool } = require("../config/dbconfig");

const adminLogin = async (req, res) => {
    const { adminid, password } = req.body;

    if (!adminid || !password) {
        return res.status(400).json({ error: 'Admin ID and password are required parameters' });
    }

    try {
        const adminQuery = `SELECT * FROM admin WHERE adminid = ?`;
        const [adminDetails] = await hotelPool.query(adminQuery, [adminid]);

        if (adminDetails.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const admin = adminDetails[0];
        const storedPassword = admin.password;

        // Compare stored password with the provided password
        if (storedPassword !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Passwords match, generate JWT token
        const token = jwt.sign(
            { admin_id: admin.admin_id, adminid: admin.adminid },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ success: true, message: 'Successfully logged in', token, admin });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    adminLogin
};
