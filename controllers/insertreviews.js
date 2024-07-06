const { hotelPool } = require('../config/dbconfig');

const Insertreviews = async (req, res) => {
    const { hotel_id, user_id, guest_name, rating, comment } = req.body;
    const review_date = new Date();

    // Validate the input data
    if (!hotel_id || !user_id || !guest_name || !rating || !comment) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Insert review into the database
    try {
        const [result] = await hotelPool.query(
            `INSERT INTO reviews (hotel_id, user_id, guest_name, rating, comment, review_date) VALUES (?, ?, ?, ?, ?, ?)`,
            [hotel_id, user_id, guest_name, rating, comment, review_date]
        );

        // Send success response
        res.status(201).json({ message: "Review added successfully", reviewId: result.insertId });
    } catch (error) {
        console.error("Error inserting review:", error);
        res.status(500).json({ error: "An error occurred while adding the review" });
    }
};

module.exports = { Insertreviews };
