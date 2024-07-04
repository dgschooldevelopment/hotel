const { hotelPool } = require('../config/dbconfig');
const { geocodeAddress } = require('../middleware/geocodeAddress'); // Adjust path as per your project structure

const Inserthotel_List = async (req, res) => {
    const {
        name,
        total_no_of_guests,
        total_no_of_rooms,
        type_of_accommodation,
        location,
        price_per_room,
        about,
        spaces,
        meals,
        experience,
        home_rules_and_truths,
        images // Array of objects with image_url and image_description
    } = req.body;

    try {
        // Geocode the address to get latitude and longitude
        const { latitude, longitude } = await geocodeAddress(location);

        // Start a transaction
        await hotelPool.query('START TRANSACTION');

        // Insert the hotel into the database
        const insertHotelQuery = `
            INSERT INTO hotel_list 
                (name, total_no_of_guests, total_no_of_rooms, type_of_accommodation, location, price_per_room, about, spaces, meals, experience, home_rules_and_truths, latitude, longitude, faq,
        policy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
        `;
        const [insertHotelResult] = await hotelPool.query(insertHotelQuery, [
            name,
            total_no_of_guests,
            total_no_of_rooms,
            type_of_accommodation,
            location,
            price_per_room,
            about,
            spaces,
            meals,
            experience,
            home_rules_and_truths,
            latitude, faq,
            policy,
            longitude
        ]);

        if (insertHotelResult.affectedRows !== 1) {
            throw new Error('Failed to create hotel');
        }

        const hotel_id = insertHotelResult.insertId;

        // Insert images into the hotel_images table
        if (images && images.length > 0) {
            const imageValues = images.map(image => [hotel_id, image.image_url, image.image_description]);
            const insertImagesQuery = `
                INSERT INTO hotel_images (hotel_id, image_url, image_description)
                VALUES ?
            `;
            await hotelPool.query(insertImagesQuery, [imageValues]);
        }

        // Commit the transaction
        await hotelPool.query('COMMIT');

        res.status(201).json({ success: true, message: 'Hotel created successfully' });
    } catch (error) {
        // Rollback the transaction in case of an error
        await hotelPool.query('ROLLBACK');
        console.error('Error creating hotel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    Inserthotel_List
};
