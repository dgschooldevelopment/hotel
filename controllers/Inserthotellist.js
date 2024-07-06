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
        amenities,
        policy_rules, // JSON data
        facilities, // JSON data
        FAQ, // JSON data
        home_rules_and_truths, // JSON data
        meals, // Array of meal objects
        hotel_images // Array of image objects
    } = req.body;

    const connection = await hotelPool.getConnection();

    try {
        // Geocode the address to get latitude and longitude
        const { latitude, longitude } = await geocodeAddress(location);

        // Start a transaction
        await connection.beginTransaction();

        // Insert the hotel into the database
        const insertHotelQuery = `
            INSERT INTO hotel_list 
                (name, total_no_of_guests, total_no_of_rooms, type_of_accommodation, location, price_per_room, about, policy_rules, facilities, FAQ, locationcodeaddress, home_rules_and_truths, amenities)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [insertHotelResult] = await connection.query(insertHotelQuery, [
            name,
            JSON.stringify(total_no_of_guests),
            total_no_of_rooms,
            type_of_accommodation,
            location,
            price_per_room,
            about,
            JSON.stringify(policy_rules),
            JSON.stringify(facilities),
            JSON.stringify(FAQ),
            JSON.stringify({ latitude, longitude }), // Combine latitude and longitude into a single JSON object
            JSON.stringify(home_rules_and_truths),
            JSON.stringify(amenities)
        ]);

        if (insertHotelResult.affectedRows !== 1) {
            throw new Error('Failed to create hotel');
        }

        const hotelId = insertHotelResult.insertId;

        // Insert into meal table
        const mealQuery = `
            INSERT INTO meal (hotel_id, meal_name, description, image_data) VALUES (?, ?, ?, ?)
        `;
        for (const meal of meals) {
            await connection.query(mealQuery, [
                hotelId, meal.meal_name, meal.description, meal.image_data
            ]);
        }

        // Insert into hotel_images table
        const hotelImageQuery = `
            INSERT INTO hotel_images (hotel_id, image_url, image_description) VALUES (?, ?, ?)
        `;
        for (const image of hotel_images) {
            await connection.query(hotelImageQuery, [
                hotelId, image.image_url, image.image_description
            ]);
        }

        // Commit the transaction
        await connection.commit();

        res.status(201).json({ success: true, message: 'Hotel created successfully', hotelId });
    } catch (error) {
        // Rollback the transaction in case of an error
        await connection.rollback();
        console.error('Error creating hotel:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
};

module.exports = {
    Inserthotel_List
};
