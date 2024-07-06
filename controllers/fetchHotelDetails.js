const { hotelPool } = require('../config/dbconfig');

const fetchHotelDetails = async (req, res) => {
    const hotelId = req.query.hotelId; // Assuming hotelId is passed as a query parameter

    try {
        const query = `
            SELECT
                h.hotel_id,
                h.name AS hotel_name,
                h.total_no_of_guests,
                h.total_no_of_rooms,
                h.type_of_accommodation,
                h.location,
                h.price_per_room,
                h.about,
                h.policy_rules,
                h.facilities,
                h.FAQ,
                h.location,
                h.home_rules_and_truths,
                h.villa_id,
                h.Amenities,
                m.meal_id,
                m.meal_name,
                m.description AS meal_description,
                m.image_data AS meal_image_data,
                r.review_id,
                r.user_id,
                r.guest_name,
                r.rating,
                r.comment,
                r.review_date,
                hi.image_id AS hotel_image_id,
                hi.image_url AS hotel_image_url,
                hi.image_description AS hotel_image_description,
                hi.image AS image_data_hotel
            FROM
                hotel_list h
            LEFT JOIN
                meal m ON h.hotel_id = m.hotel_id
            LEFT JOIN
                reviews r ON h.hotel_id = r.hotel_id
            LEFT JOIN
                hotel_images hi ON h.hotel_id = hi.hotel_id
            WHERE
                h.hotel_id = ?
        `;
        
        const [rows] = await hotelPool.query(query, [hotelId]);

        // Check if rows exist
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // Initialize hotelDetails object
        const hotelDetails = {
            hotel_id: rows[0].hotel_id,
            hotel_name: rows[0].hotel_name,
            total_no_of_guests: rows[0].total_no_of_guests,
            total_no_of_rooms: rows[0].total_no_of_rooms,
            type_of_accommodation: rows[0].type_of_accommodation,
            location: rows[0].location,
            price_per_room: rows[0].price_per_room,
            about: rows[0].about,
            policy_rules: rows[0].policy_rules,
            facilities: rows[0].facilities,
            FAQ: rows[0].FAQ,
            location_code_address: rows[0].location_code_address,
            home_rules_and_truths: rows[0].home_rules_and_truths,
            villa_id: rows[0].villa_id,
            Amenities: rows[0].Amenities,
            meals: [],
            reviews: [],
            hotel_images: []
        };

        // Track added meals and reviews for uniqueness
        const addedMeals = {};
        const addedReviews = {};
        const addedHotelImages = {};

        rows.forEach(row => {
            // Populate meals
            if (row.meal_id && !addedMeals[row.meal_id]) {
                hotelDetails.meals.push({
                    meal_id: row.meal_id,
                    meal_name: row.meal_name,
                    meal_description: row.meal_description,
                    meal_image_data: row.meal_image_data ? row.meal_image_data.toString('base64') : null,
                });
                addedMeals[row.meal_id] = true;
            }

            // Populate reviews
            if (row.review_id && !addedReviews[row.review_id]) {
                hotelDetails.reviews.push({
                    review_id: row.review_id,
                    user_id: row.user_id,
                    guest_name: row.guest_name,
                    rating: row.rating,
                    comment: row.comment,
                    review_date: row.review_date
                });
                addedReviews[row.review_id] = true;
            }

            // Populate hotel images
            if (row.hotel_image_id && !addedHotelImages[row.hotel_image_id]) {
                hotelDetails.hotel_images.push({
                    image_id: row.hotel_image_id,
                    image_url: row.hotel_image_url,
                    image_description: row.hotel_image_description,
                    image_data_hotel: row.image_data_hotel ? row.image_data_hotel.toString('base64') : null,
                });
                
                addedHotelImages[row.hotel_image_id] = true;
            }
        });

        // Send the formatted hotel details JSON response
        res.status(200).json(hotelDetails);
    } catch (error) {
        console.error('Error fetching hotel details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    fetchHotelDetails
};
